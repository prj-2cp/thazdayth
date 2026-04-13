const User = require("../models/userModel")
const Notification = require("../models/notificationsModel")
const { sendNotificationEmail } = require("../utils/sendEmail")

const createNotification = async (userId, title, message, orderId) => {
    try {
        const notificationData = {
            user_id: userId,
            title,
            message,
        };

        if (orderId) {
            notificationData.order_id = orderId;
        }

        const notification = await Notification.create(notificationData);

        // Also send an email notification
        try {
            const user = await User.findById(userId);
            if (user && user.email) {
                await sendNotificationEmail(user.email, title, message);
            }
        } catch (emailError) {
            console.error('[NOTIF-EMAIL-ERROR] Failed to send email for notification:', emailError);
        }

        return notification;
    } catch (error) {
        console.error('[NOTIF-ERROR] Create fail:', error);
        return null;
    }
};

const createNotificationRoute = async (req, res) => {
    try {
        const { title, message, order_id } = req.body;
        const user_id = req.user.id;

        if (!user_id || !title || !message) {
            return res.status(400).json({ message: "user_id, title, and message are required" });
        }

        const notification = await createNotification(user_id, title, message, order_id);

        if (!notification) {
            return res.status(500).json({ message: "Failed to create notification" });
        }

        res.status(201).json(notification);
    } catch (error) {
        console.error('[NOTIF-ROUTE-ERROR]', error);
        res.status(500).json({ message: "Error creating notification" });
    }
};

module.exports = { createNotification, createNotificationRoute };
