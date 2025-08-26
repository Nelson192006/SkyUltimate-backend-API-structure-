const express = require('express');
const router = express.Router();
const Order = require('./Order');
const Settings = require('./Settings');
const Payout = require('./Payout');
const authMiddleware = require('./middleware/auth');

// Customer confirms payment
router.patch('/:id/confirm-payment', authMiddleware, async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = 'PaymentConfirmed';
    await order.save();
    res.json({ message: 'Payment confirmed' });
});

// Customer confirms pickup
router.patch('/:id/confirm-pickup', authMiddleware, async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = 'PickedUp';
    await order.save();
    res.json({ message: 'Pickup confirmed' });
});

// Customer confirms delivery
router.patch('/:id/confirm-delivery', authMiddleware, async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const settings = await Settings.get();
    order.status = 'Delivered';
    order.agentRevenue = order.pricePaid * settings.commissionRateAgent; // Only Agent revenue
    await order.save();

    // Create payout for agent
    if (order.agent) {
        await Payout.create({
            agent: order.agent,
            amount: order.agentRevenue
        });
    }

    res.json({
        message: 'Delivery confirmed',
        agentRevenue: order.agentRevenue
    });
});

module.exports = router;
