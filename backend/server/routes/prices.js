const express = require("express");
const {body, validationResult} = require("express-validator");
const OliveCategory = require("../models/oliveCategoryModel");
const PressingService = require("../models/pressingServiceModel");
const {authenticate, ownerOnly} = require("../middleware/auth");
const router = express.Router()

router.get('/olives', async (req, res) => {
    try {
        const categories = await OliveCategory.find({ active: true });
        res.json(categories);
    }
    catch (err) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

router.post('/olives', authenticate, ownerOnly, [
    body('name').notEmpty().withMessage('Le nom est requis'),
    body('price_per_liter').isNumeric().withMessage('Le prix doit être un nombre'),
    body('stock_liters').optional().isNumeric().withMessage('Le stock doit être un nombre'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const {name, price_per_liter, stock_liters} = req.body
        const category = await OliveCategory.create({
            name,
            price_per_liter,
            stock_liters
        });
        res.status(201).json(category);
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Cette catégorie existe déjà.' });
            return;
        }
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});


router.patch('/olives/:id', authenticate, ownerOnly, [
    body('name').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
    body('price_per_liter').optional().isNumeric().withMessage('Le prix doit être un nombre'),
    body('stock_liters').optional().isNumeric().withMessage('Le stock doit être un nombre'),
    body('active').optional().isBoolean().withMessage('Actif doit être un booléen'),
], async (req, res) => {
    try {
        const category = await OliveCategory.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
        if (!category) {
            res.status(404).json({ message: 'Catégorie introuvable.' });
            return;
        }
        res.json(category);
    }
    catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

router.delete('/olives/:id', authenticate, ownerOnly, async (req, res) => {
    try {
        const category = await OliveCategory.findByIdAndDelete(req.params.id);
        if (!category) {
            res.status(404).json({ message: 'Catégorie introuvable.' });
            return;
        }
        res.json({ message: 'Catégorie supprimée avec succès.' });
    }
    catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

router.get('/pressing', async (req, res) => {
    try {
        const services = await PressingService.find({ active: true });
        res.json(services);
    }
    catch {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

router.post('/pressing', authenticate, ownerOnly, [
    body('name').notEmpty().withMessage('Le nom est requis'),
    body('fee').isNumeric().withMessage('Le frais doit être un nombre'),
    body('yield_per_kg').optional().isNumeric().withMessage('Le rendement doit être un nombre'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const { name, fee, yield_per_kg } = req.body
        const service = await PressingService.create({
            name,
            fee,
            yield_per_kg
        });
        res.status(201).json(service);
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Ce service existe déjà.' });
            return;
        }
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

router.patch('/pressing/:id', authenticate, ownerOnly, [
    body('name').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
    body('fee').optional().isNumeric().withMessage('Le frais doit être un nombre'),
    body('yield_per_kg').optional().isNumeric().withMessage('Le rendement doit être un nombre'),
    body('active').optional().isBoolean().withMessage('Actif doit être un booléen'),
], async (req, res) => {
    try {
        const service = await PressingService.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
        if (!service) {
            res.status(404).json({ message: 'Service introuvable.' });
            return;
        }
        res.json(service);
    }
    catch {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

router.delete('/pressing/:id', authenticate, ownerOnly, async (req, res) => {
    try {
        const service = await PressingService.findByIdAndDelete(req.params.id);
        if (!service) {
            res.status(404).json({ message: 'Service introuvable.' });
            return;
        }
        res.json({ message: 'Service supprimé avec succès.' });
    }
    catch {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

exports.default = router;