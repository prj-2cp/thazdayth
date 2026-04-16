const express = require("express")
const { body, validationResult } = require("express-validator")
const Order = require("../models/ordersModel")
const Notification = require("../models/notificationsModel")
require("../models/pressingServiceModel")
const { authenticate, ownerOnly } = require("../middleware/auth")



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






exports.default = router