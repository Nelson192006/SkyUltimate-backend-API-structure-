const express = require('express');
const router = express.Router();
const Payout = require('./payout'); // lowercase
const authMiddleware = require('./middleware/auth');

// Create payout
router.post('/', authMiddleware, async (req, res) => {
    const { agent, amount } = req.body;
    const payout = await Payout.create({ agent, amount });
    res.json(payout);
});

// Get all payouts
router.get('/', authMiddleware, async (req, res) => {
    const payouts = await Payout.find();
    res.json(payouts);
});

module.exports = router;
