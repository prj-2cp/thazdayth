const express = require("express");
const ShippingRate = require("../models/shippingRateModel");
const { authenticate, ownerOnly } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// GET /api/shipping-rates — Public
router.get('/', async (req, res) => {
    try {
        const rates = await ShippingRate.find().sort({ wilaya_code: 1 });
        res.json(rates);
    }
    catch (err) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// POST /api/shipping-rates — Owner only
router.post('/', authenticate, ownerOnly, [
    body('wilaya_code').isNumeric().withMessage('Code wilaya invalide'),
    body('wilaya').notEmpty().withMessage('Le nom de la wilaya est requis'),
    body('price').isNumeric().withMessage('Le prix doit être un nombre'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const rate = await ShippingRate.create(req.body);
        res.status(201).json(rate);
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Cette wilaya existe déjà.' });
            return;
        }
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// PATCH /api/shipping-rates/:id — Owner only
router.patch('/:id', authenticate, ownerOnly, [
    body('price').optional().isNumeric().withMessage('Le prix doit être un nombre'),
    body('wilaya').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
], async (req, res) => {
    try {
        const rate = await ShippingRate.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!rate) {
            res.status(404).json({ message: 'Wilaya introuvable.' });
            return;
        }
        res.json(rate);
    }
    catch (err) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// DELETE /api/shipping-rates/:id — Owner only
router.delete('/:id', authenticate, ownerOnly, async (req, res) => {
    try {
        const rate = await ShippingRate.findByIdAndDelete(req.params.id);
        if (!rate) {
            res.status(404).json({ message: 'Wilaya introuvable.' });
            return;
        }
        res.json({ message: 'Tarif supprimé avec succès.' });
    }
    catch (err) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

exports.default = router;