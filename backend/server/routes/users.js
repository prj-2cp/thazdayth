const express = require("express")
const User = require("../models/userModel")
const { authenticate, ownerOnly } = require("../middleware/auth")

const router = express.Router();

/**
 * [ADMIN] List all customers
 */
router.get('/', authenticate, ownerOnly, async (req, res) => {
    try {
        const users = await User.find({ role: 'customer' })
            .select('first_name last_name email phone address is_blacklisted created_at')
            .sort({ created_at: -1 });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

/**
 * [ADMIN] Toggle Blacklist
 */
router.patch('/:id/blacklist', authenticate, ownerOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'Utilisateur non trouvé.' });
            return;
        }

        user.is_blacklisted = !user.is_blacklisted;
        await user.save();

        res.json({ 
            message: user.is_blacklisted ? 'Utilisateur mis en liste noire.' : 'Utilisateur retiré de la liste noire.',
            is_blacklisted: user.is_blacklisted 
        });
    } catch (error) {
        console.error('Error toggling blacklist status:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

exports.default = router;