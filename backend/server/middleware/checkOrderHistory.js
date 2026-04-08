const Order = require("../models/ordersModel");
const PressingRequest = require("../models/pressingRequestsModel");

const checkOrderHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Check for delivered product orders
        const deliveredOrder = await Order.findOne({
            user_id: userId,
            status: 'delivered'
        });

        if (deliveredOrder) {
            return next();
        }

        // Check for collected orders 
        const collectedOrder = await Order.findOne({
            user_id: userId,
            'shipping.pickup_status': 'collected'
        });

        if (collectedOrder) {
            return next();
        }

        // Check for completed pressing requests
        const completedPressing = await PressingRequest.findOne({
            user_id: userId,
            status: 'completed'
        });

        if (completedPressing) {
            return next();
        }

        // If neither delivered orders, collected orders, nor completed pressing requests found
        return res.status(403).json({
            message: 'Vous devez avoir au moins une commande livrée ou collectée, ou un service de pressage complété pour poster un commentaire.'
        });
    } catch (err) {
        console.error('Error checking order history:', err);
        return res.status(500).json({ message: 'Erreur lors de la vérification de l\'historique des commandes.' });
    }
};

module.exports = { checkOrderHistory };
