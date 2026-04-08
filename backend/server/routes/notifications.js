require("dotenv").config()
const express = require("express")
const Notifications = require("../models/notificationsModel")
const {authenticate} = require("../middleware/auth")

const router = express.Router()

//get all notifications of a user   
router.get("/", authenticate, 
    async (req, res) => {
        try {
            const notifications = await Notifications.find({user_id: req.user.id}).sort({created_at: -1});
            res.json(notifications);

        } catch(err) {
            res.status(500).json({ message: 'Erreur lors de la récupération des notifications.' });
        }
    }
);

//update all user's notifications and mark them as read
router.patch("/read-all", authenticate,
    async (req, res) => {
        try {
            await Notifications.updateMany({user_id: req.user.id, is_read: false}, {is_read: true});
            res.json({message: 'All notifications has been marked as read'});
        } catch(err) {
            res.status(500).json({ message: 'erreur lors de la mise a jour des notifications.' });
        }
    }
);

//get the number of the unread notifications (might be useful for the front)
router.get("/unread-count", authenticate, 
    async(req, res) => {
        try {
            const count = await Notifications.countDocuments({user_id: req.user.id, is_read: false});
            res.json({ count })
        } catch(err) {
            res.status(500).json({ message: 'Erreur lors du comptage des notifications.' })
        }
    }  
);

//mark a certain notification as read
router.patch("/:id/read", authenticate, 
    async (req, res) => {
        try {
            const notification = await Notifications.findOneAndUpdate({ _id: req.params.id, user_id: req.user.id }, {is_read: true}, {new: true});
            if(!notification) {
                res.status(404).json({ message: 'Notification non trouvée' })
                return
            }
            res.json(notification)
        } catch(err) {
            res.status(500).json({ message: 'Erreur lors de la mise à jour de la notification.' });
        }
    }
)