const express = require("express")
const { body, validationResult } = require("express-validator")
const Order = require("../models/ordersModel")
const Notification = require("../models/notificationsModel")
require("../models/pressingServiceModel")
const { authenticate, ownerOnly } = require("../middleware/auth")
const Product = require("../models/productsModel")
const OliveCategory = require("../models/oliveCategoryModel")
const crypto = require("crypto")
const { createNotification } = require("../controllers/notificationController")
const Users = require("../models/userModel")


const router = express.Router()

router.get("/", authenticate, ownerOnly,
    async (req, res) => {
        try {
            const orders = await Order.find({ is_archived : false})
                .populate("user_id", "first_name last_name email phone adress is_blacklisted")
                .populate({ path: "items.olive_category_id" })
                .populate({ path: "items.pressing_service_id", select: "name"})
                .sort({ created_at: -1 });
            res.json(orders);
        } catch(err) {
            console.log(err);
            res.status(500).json({ message: 'Erreur serveur.' });
        }
        
    }
);

router.get("/my", authenticate, 
    async (req, res) => {
        try {
            const myOrders = await Order.find({ user_id: req.user.id })
                .populate({ path: "items.olive_category_id" })
                .populate({ path: "items.pressing_service_id", select: "name"})
                .sort({ created_at: -1 });
            res.json(myOrders);
        } catch(err) {
            res.status(500).json({  message: 'Erreur serveur.' });
        }
    }
)

// Add an order as a customer
router.post("/", authenticate, [
    body("items").isArray({ min: 1 }).withMessage("The cart must have at least 1 item"),
    body("item.*.quantity").isNumeric().withMessage("Quantity must be a number"),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    try {
        const user = await Users.findById(req.user.id);
        if (user && user.is_blacklisted) {
            res.status(403).json({ message: 'Votre compte est restreint. Vous ne pouvez pas passer de commande.' });
            return;
        }
        

        const { items, shipping, total } = req.body;

        // Check stock for each item in the cart
        for (const item of items) {
            const model = (item.model_type === "Product" ? Product : OliveCategory);
            const itemData = await model.findById(item.olive_category_id || item.product_id);
            if (!itemData) {
                res.status(404).json({ message: "Article introuvable." });
                return;
            }
            if (itemData.stock_liters < item.quantity) {
                res.status(400).json({ message: `Stock insuffisant pour ${itemData.name}` });
                return;
            }
        }

        // Generate the tracking code for the order
        const tracking_code = crypto.randomBytes(3).toString('hex').toUpperCase();

        // Create the order in the database
        const order = await Order.create({
            user_id: req.user.id,
            items,
            shipping,
            total,
            tracking_code,
            status: 'pending'
        });

        const orderRef = order._id.toString().slice(-6).toUpperCase();

        // Update stock
        for (const item of items) {
            if (item.olive_category_id) {
                const model = (item.model_type === 'Product' ? Product : OliveCategory);
                await model.findByIdAndUpdate(item.olive_category_id, {
                    $inc: { stock_liters: -item.quantity }
                });
            }
        }

        // Populate data for response
        const populatedOrder = await order.populate([
            { path: 'user_id', select: 'first_name last_name email phone address' },
            { path: 'items.olive_category_id' },
            { path: 'items.pressing_service_id' }
        ]);

        // Create a notification
        const notifTitle = "🛒 Nouvelle commande reçue !";
        const notifContent = `Une nouvelle commande #${orderRef} vient d'être passée. Montant total : ${total} DA.`;
        const owners = await Users.find({ role: "owner" }, '_id');
        for (const owner of owners) {
            await createNotification(owner._id, notifTitle, notifContent, order._id);
        }

        res.status(201).json({ message: "Commande créée avec succès", populatedOrder });
    } catch (err) {
        console.log("Order creation error: ", err);
        res.status(500).json({ message: "Erreur serveur." });
    }
});



router.patch('/:id/status', authenticate, ownerOnly, async (req, res) => {
    const { status } = req.body;
    const valid = ['pending', 'in-progress', 'completed', 'delivered', 'cancelled'];
    if (!valid.includes(status)) {
        res.status(400).json({ message: 'Statut invalide.' });
        return;
    }
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' });
        if (!order) {
            res.status(404).json({ message: 'Commande introuvable.' });
            return;
        }
        //notify the user
        const notifTitle = "Mise à jour de votre commande";
        const notifContent = `Le statut de votre commande est maintenant : ${status}.`;
        await createNotification(order.user_id, notifContent, notifTitle, order._id);
        res.json(order);
    } catch(err) {
        res.status(500).json({ message: "Erreur serveur." });
    }
});

exports.default = router