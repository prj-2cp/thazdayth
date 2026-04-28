const express = require("express")
const Settings = require("../models/settingsModel")
const { authenticate, ownerOnly } = require("../middleware/auth")

const router = express.Router();

// GET /api/settings
router.get('/', async (req, res) => {
    try {
        const settings = await Settings.findOne();
        res.json(settings || { pressing_percentage_taken: 30 });
    }
    catch (err) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// PUT /api/settings — Owner only
router.put('/', authenticate, ownerOnly, async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate({}, { ...req.body, updated_at: new Date() }, { new: true, upsert: true });
        res.json(settings);
    }
    catch (err) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

exports.default = router;
