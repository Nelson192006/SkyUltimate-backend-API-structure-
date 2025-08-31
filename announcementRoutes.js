// announcementRoutes.js
const express = require("express");
const router = express.Router();
const Announcement = require("./announcement");
const { protect } = require("./authMiddleware");
const { allowRoles } = require("./roleMiddleware");

// GET latest active announcement (public)
router.get("/latest", async (req, res) => {
  const a = await Announcement.findOne({ isActive: true }).sort({ createdAt: -1 });
  res.json(a || null);
});

// Admin create
router.post("/", protect, allowRoles("Admin", "SuperAdmin"), async (req, res) => {
  const doc = new Announcement(req.body);
  await doc.save();
  res.status(201).json(doc);
});

// Admin deactivate
router.put("/:id/deactivate", protect, allowRoles("Admin", "SuperAdmin"), async (req, res) => {
  const a = await Announcement.findById(req.params.id);
  if (!a) return res.status(404).json({ message: "Not found" });
  a.isActive = false;
  await a.save();
  res.json(a);
});

module.exports = router;
