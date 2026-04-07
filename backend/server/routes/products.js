require("dotenv").config();
const express = require("express");
const { body, validationResult } = require("express-validator");
const { authenticate, ownerOnly } = require("../middleware/auth");
const Product = require("../models/productsModel");

const router = express.Router();

// List all products (public)
router.get("/", async (req, res) => {
    try {
        const products = await Product.find({is_available: true});
        res.json(products);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erreur serveur." });
    }
});

// Get one product by ID (public)
//tested ✅
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: "Produit non trouvé." });
            return;
        }
        res.json(product);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erreur serveur." });
    }
});

// Create a product (owner only)
//tested ✅
router.post("/",
    authenticate,
    ownerOnly,
    [
        body("name").notEmpty().withMessage("Le nom est requis"),
        body("category").isIn(["extra_vergin", "virgin", "third_quality"]).withMessage("Catégorie invalide"),
        body("price_per_liter").isNumeric().withMessage("Le prix doit être un nombre"),
        body("stock_liters").optional().isNumeric().withMessage("Le stock doit être un nombre"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { name, category, price_per_liter, stock_liters, is_available } = req.body;

        try {
            const product = await Product.create({
                name,
                category,
                price_per_liter,
                stock_liters: stock_liters ?? 0,
                is_available: is_available ?? true,
            });
            res.status(201).json(product);
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Erreur serveur." });
        }
    }
);

// Update a product (owner only)
//tested ✅ 
router.patch("/:id",
    authenticate,
    ownerOnly,
    [
        body("name").optional().notEmpty().withMessage("Le nom ne peut pas être vide"),
        body("category").optional().isIn(["extra_vergin", "virgin", "third_quality"]).withMessage("Catégorie invalide"),
        body("price_per_liter").optional().isNumeric().withMessage("Le prix doit être un nombre"),
        body("stock_liters").optional().isNumeric().withMessage("Le stock doit être un nombre"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        try {
            const product = await Product.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            if (!product) {
                res.status(404).json({ message: "Produit non trouvé." });
                return;
            }
            res.json(product);
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Erreur serveur." });
        }
    }
);

// Delete a product (owner only)
//tested ✅
router.delete("/:id", authenticate, ownerOnly, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            res.status(404).json({ message: "Produit non trouvé." });
            return;
        }
        res.json({ message: "Produit supprimé." });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erreur serveur." });
    }
});

exports.default = router;
