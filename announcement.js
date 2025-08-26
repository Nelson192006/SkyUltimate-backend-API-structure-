const express = require('express');
const router = express.Router();
const announcement = require('./announcementModel'); // lowercase
const authMiddleware = require('./middleware/auth');

// Create announcement
router.post('/', authMiddleware, async (req, res) => {
    const { title, message } = req.body;
    const announcement = await Announcement.create({ title, message });
    res.json(announcement);
});

// Get all announcements
router.get('/', authMiddleware, async (req, res) => {
    const announcements = await Announcement.find();
    res.json(announcements);
});

module.exports = routerAnnouncementnnouncement
