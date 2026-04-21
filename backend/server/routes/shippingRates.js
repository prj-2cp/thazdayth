const express = require("express");
const ShippingRate = require("../models/shippingRateModel");
const { authenticate, ownerOnly } = require("../middleware/auth");
const router = express.Router();
// GET /api/shipping-rates — Public
router.get('/', async (req, res) => {
    try {
        const rates = await ShippingRate.find().sort({ wilaya_code: 1 });
        res.json(rates);
    }
    catch {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});
// PUT /api/shipping-rates/:wilaya — Owner only
router.put('/:wilaya', authenticate, ownerOnly, async (req, res) => {
    try {
        const rate = await ShippingRate.findOneAndUpdate({ wilaya: req.params.wilaya }, { price: req.body.price }, { returnDocument: 'after' });
        if (!rate) {
            res.status(404).json({ message: 'Wilaya introuvable.' });
            return;
        }
        res.json(rate);
    }
    catch {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});
exports.default = router;