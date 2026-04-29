const express = require("express")
const { body, validationResult } = require("express-validator")
const PressingRequest = require("../models/pressingRequestsModel")
const Notification = require("../models/notificationsModel")
const User = require("../models/userModel")
const { authenticate, ownerOnly } = require("../middleware/auth")
const crypto = require("crypto")
const { createNotification } = require("../controllers/notificationController")

const router = express.Router()

/**
 * [ADMIN] View all pressing requests
 */
router.get('/', authenticate, ownerOnly, async (req, res) => {
    try {
        const requests = await PressingRequest.find({ is_archived: false })
            .populate('user_id', 'first_name last_name email phone is_blacklisted')
            .sort({ created_at: -1 });
        res.json(requests);
    }
    catch (err) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

/**
 * [CUSTOMER] View my own requests
 */
router.get('/my', authenticate, async (req, res) => {
    try {
        const requests = await PressingRequest.find({ user_id: req.user.id }).sort({ created_at: -1 });
        res.json(requests);
    }
    catch (err) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

/**
 * [CUSTOMER] Submit a new pressing request
 */
router.post('/', authenticate, [
    body('olive_quantity_kg').isNumeric().withMessage('Quantité invalide'),
    body('payment.type').isIn(['money', 'olives']),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const user = await User.findById(req.user.id);
        if (user && user.is_blacklisted) {
            res.status(403).json({ message: 'Votre compte est restreint. Vous ne pouvez pas réserver de pressage.' });
            return;
        }

        const { olive_quantity_kg, oil_quality, yield: yieldData, payment, bring_olives_date, collect_oil_date } = req.body;
        if (olive_quantity_kg < 50) {
            res.status(400).json({ message: 'La quantité minimale est de 50 kg.' });
            return;
        }
        const tracking_code = crypto.randomBytes(3).toString('hex').toUpperCase();
        const request = await PressingRequest.create({
            user_id: req.user.id,
            olive_quantity_kg,
            oil_quality,
            yield: {
                liters_per_kg: yieldData?.liters_per_kg || 0,
                produced_oil_liters: yieldData?.produced_oil_liters || 0,
            },
            payment: {
                type: payment.type,
                pressing_price_per_kg: payment.pressing_price_per_kg,
                percentage_taken: payment.percentage_taken,
            },
            tracking_code,
            status: 'pending',
            bring_olives_date: bring_olives_date ? new Date(bring_olives_date) : undefined,
            collect_oil_date: collect_oil_date ? new Date(collect_oil_date) : undefined,
        });

        res.status(201).json(request);
    }
    catch (error) {
        console.error('Pressing request error:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

/**
 * [ADMIN] Update Request Status
 */
router.patch('/:id/status', authenticate, ownerOnly, async (req, res) => {
    const { status } = req.body;
    const valid = ['pending', 'accepted', 'rejected', 'completed'];
    if (!valid.includes(status)) {
        res.status(400).json({ message: 'Statut invalide.' });
        return;
    }
    try {
        if (status === 'rejected') {
            const request = await PressingRequest.findById(req.params.id);
            if (!request) {
                res.status(404).json({ message: 'Demande introuvable.' });
                return;
            }
            const notifTitle = 'Demande de pressage rejetée';
            const notifContent = 'Votre demande de pressage a été rejetée.';
            await createNotification(request.user_id, notifTitle, notifContent, request._id);

            await PressingRequest.findByIdAndDelete(req.params.id);
            res.json({ message: 'Demande supprimée.', request });
            return;
        }

        const request = await PressingRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!request) {
            res.status(404).json({ message: 'Demande introuvable.' });
            return;
        }

        await createNotification(request.user_id, 'Mise à jour de votre demande de pressage', `Le statut de votre demande de pressage est maintenant : ${status}.`, request._id);

        res.json(request);
    }
    catch (err) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

/**
 * [ADMIN] Schedule Appointment
 */
router.patch('/:id/appointment', authenticate, ownerOnly, [
    body('bring_olives_date').optional().isISO8601(),
    body('collect_oil_date').optional().isISO8601()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const updateFields = {};
        if (req.body.bring_olives_date)
            updateFields.bring_olives_date = new Date(req.body.bring_olives_date);
        if (req.body.collect_oil_date)
            updateFields.collect_oil_date = new Date(req.body.collect_oil_date);
            
        const request = await PressingRequest.findByIdAndUpdate(req.params.id, updateFields, { new: true });
        if (!request) {
            res.status(404).json({ message: 'Demande introuvable.' });
            return;
        }
        
        let datesMessage = '';
        if (req.body.bring_olives_date)
            datesMessage += `\nApport des olives : ${new Date(req.body.bring_olives_date).toLocaleDateString()}`;
        if (req.body.collect_oil_date)
            datesMessage += `\nRécupération d'huile : ${new Date(req.body.collect_oil_date).toLocaleDateString()}`;
            
        await createNotification(request.user_id, 'Dates de pressage programmées', `Vos dates ont été fixées : ${datesMessage}`, request._id);
        
        res.json(request);
    }
    catch (err) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

/**
 * ARCHIVE AND DELETE
 */
router.get('/archived', authenticate, ownerOnly, async (req, res) => {
    try {
        const requests = await PressingRequest.find({ is_archived: true })
            .populate('user_id', 'first_name last_name email phone is_blacklisted')
            .sort({ updated_at: -1 });
        res.json(requests);
    }
    catch (err) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

router.patch('/:id/archive', authenticate, ownerOnly, async (req, res) => {
    try {
        const request = await PressingRequest.findByIdAndUpdate(req.params.id, { is_archived: true }, { new: true });
        if (!request) {
            res.status(404).json({ message: 'Demande introuvable.' });
            return;
        }
        res.json(request);
    }
    catch (err) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

router.delete('/:id', authenticate, ownerOnly, async (req, res) => {
    try {
        const request = await PressingRequest.findByIdAndDelete(req.params.id);
        if (!request) {
            res.status(404).json({ message: 'Demande introuvable.' });
            return;
        }
        res.json({ message: 'Demande supprimée.' });
    }
    catch (err) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

exports.default = router;
