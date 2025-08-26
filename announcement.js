const express = require('express');
const router = express.Router();
const announcementModel = require('./announcement');
const authMiddleware = require('./auth');

router.post('/', authMiddleware, async (req, res) => {
    const { title, message } = req.body;
    const announcement = await announcementModel.create({ title, message });
    res.json(announcement);
});

router.get('/', authMiddleware, async (req, res) => {
    const announcements = await announcementModel.find();
    res.json(announcements);
});

module.exports = router;
