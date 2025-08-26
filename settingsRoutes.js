const express = require('express');
const router = express.Router();
const Settings = require('./settings');
const authMiddleware = require('./middleware/auth');

// GET settings
router.get('/', authMiddleware, async (req, res) => {
    const settings = await Settings.get();
    res.json(settings);
});

// UPDATE settings (Super Admin only)
router.patch('/', authMiddleware, async (req, res) => {
    if (req.user.role !== 'super-admin') return res.status(403).json({ error: 'Forbidden' });

    const { allowAdminRegistration, commissionRateAgent, bankDetails, announcementMessage } = req.body;
    const settings = await Settings.get();

    if (allowAdminRegistration !== undefined) settings.allowAdminRegistration = allowAdminRegistration;
    if (commissionRateAgent !== undefined) settings.commissionRateAgent = commissionRateAgent;
    if (bankDetails) settings.bankDetails = bankDetails;
    if (announcementMessage !== undefined) settings.announcementMessage = announcementMessage;

    await settings.save();
    res.json(settings);
});

module.exports = router;
