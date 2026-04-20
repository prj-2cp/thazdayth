const express = require("express");
const Availability = require("../models/availability");
const { authenticate, ownerOnly } = require("../middleware/auth");

const router = express.Router();

//get all blocked dates
router.get("/", async (req, res) => {
    try {
        const blockedDates = await Availability.find({ is_blocked: true }).sort({ date: 1});
        res.json(blockedDates);
    } catch (err) {
        console.log("error fetching blocked dates", err)
        res.status(500).json({message: "Erreur serveur. "})
    }
})
//(Admin) post a new blocked date

router.post("/", authenticate, ownerOnly,
    async (req, res) => {
        const { date } = req.body;
        if(!date) {
            res.status(400).json({ message: "date manquante" });
            return;
        }

        const dateObj = new Date(date);
        if(isNaN(dateObj.getTime())) {
            res.status(400).json({ message: "date invalide" });
            return;
        }

        try {
            const existing = await Availability.findOne({date: dateObj});
            if(existing) {
                existing.is_blocked = true;
                await existing.save()
                res.json(existing)
                return;
            }
            const blocked = await Availability.create({
                date: new Date(date),
                is_blocked: true,
            })
            res.json(blocked)
        } catch(err) {
            res.status(500).json({ message: 'Erreur serveur.' });
        }
    }
)

router.delete('/:id', authenticate, ownerOnly, async (req, res) => {
    try {
        await Availability.findByIdAndDelete(req.params.id);
        res.json({ message: 'Date débloquée.' });
    } catch (error) {
        console.error('Error unblocking date:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

module.exports = router;