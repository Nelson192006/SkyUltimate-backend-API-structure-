// supportRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("./authMiddleware");

// simple contact endpoint
router.post("/contact", protect, async (req, res) => {
  const { subject, message } = req.body;
  // for now just return success; later save ticket to DB
  res.json({ message: "Support request received", subject, receivedAt: new Date() });
});

module.exports = router;
