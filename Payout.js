const express = require('express');
const router = express.Router();
const Payout = require('./Payout'); // new model
const authMiddleware = require('./middleware/auth');

// GET all payouts (Super Admin)
router.get('/payouts', authMiddleware, async (req, res) => {
    if(req.user.role !== 'super-admin') return res.status(403).json({ error: 'Forbidden' });
    const payouts = await Payout.find({}).populate('agent');
    res.json(payouts);
});

// Approve payout
router.patch('/payouts/:id/approve', authMiddleware, async (req, res) => {
    if(req.user.role !== 'super-admin') return res.status(403).json({ error: 'Forbidden' });
    const payout = await Payout.findById(req.params.id);
    if(!payout) return res.status(404).json({ error: 'Payout not found' });
    payout.status = 'Approved';
    await payout.save();
    res.json({ message: 'Payout approved' });
});

// Deny payout
router.patch('/payouts/:id/deny', authMiddleware, async (req, res) => {
    if(req.user.role !== 'super-admin') return res.status(403).json({ error: 'Forbidden' });
    const payout = await Payout.findById(req.params.id);
    if(!payout) return res.status(404).json({ error: 'Payout not found' });
    payout.status = 'Denied';
    await payout.save();
    res.json({ message: 'Payout denied' });
});

module.exports = router;
