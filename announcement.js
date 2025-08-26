const express = require('express');
const router = express.Router();
const Announcement = require('./Announcement'); // new Mongoose model
const authMiddleware = require('./middleware/auth'); // verifies token & role

// GET all announcements
router.get('/announcements', authMiddleware, async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.json(announcements);
    } catch(err) { res.status(500).json({ error: 'Server error' }); }
});

// POST new announcement (Super Admin only)
router.post('/announcements', authMiddleware, async (req, res) => {
    if(req.user.role !== 'super-admin') return res.status(403).json({ error: 'Forbidden' });
    const { message } = req.body;
    if(!message) return res.status(400).json({ error: 'Message required' });

    try {
        const newAnnouncement = new Announcement({ message, createdBy: req.user._id });
        await newAnnouncement.save();
        res.json(newAnnouncement);
    } catch(err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
