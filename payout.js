const express = require('express');
const router = express.Router();
const Payout = require('./payoutModel'); // lowercase
const authMiddleware = require('./middleware/auth');

// Get all payouts
router.get('/', authMiddleware, async (req, res) => {
    const payouts = await Payout.find().populate('agent', 'fullName email');
    res.json(payouts);
});

// Process payout
router.post('/', authMiddleware, async (req, res) => {
    const { agent, amount } = req.body;
    const payout = await Payout.create({ agent, amount });
    res.json(payout);
});

module.exports = router;
