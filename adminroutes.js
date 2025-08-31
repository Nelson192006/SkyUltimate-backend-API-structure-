const express = require("express");
const Announcement = require("./announcement");
const Payout = require("./payout");

const router = express.Router();

// Create announcement
router.post("/announcements", async (req, res) => {
  try {
    const announcement = new Announcement(req.body);
    await announcement.save();
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all announcements
router.get("/announcements", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Record payout
router.post("/payouts", async (req, res) => {
  try {
    const payout = new Payout(req.body);
    await payout.save();
    res.status(201).json(payout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all payouts
router.get("/payouts", async (req, res) => {
  try {
    const payouts = await Payout.find().sort({ createdAt: -1 });
    res.json(payouts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
