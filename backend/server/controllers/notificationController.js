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


module.exports = { createNotification };
