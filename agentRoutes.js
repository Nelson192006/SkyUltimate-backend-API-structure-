// agentRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("./authMiddleware");
const { allowRoles } = require("./roleMiddleware");
const User = require("./user");

// Agent: update availability / bank details
router.put("/availability", protect, allowRoles("Agent"), async (req, res) => {
  const { online } = req.body;
  const updated = await User.findByIdAndUpdate(req.user.id, { isAvailable: !!online }, { new: true }).select("-password");
  res.json({ online: updated.isAvailable });
});

// Agent: update bank details (reuse userController.me/bank if you prefer)
router.put("/bank", protect, allowRoles("Agent"), async (req, res) => {
  const { bankName, accountNumber, accountHolderName, phone } = req.body;
  const u = await User.findById(req.user.id);
  if (!u) return res.status(404).json({ message: "User not found" });
  u.bankDetails = { bankName, accountNumber, accountHolderName };
  if (phone) u.phone = phone;
  await u.save();
  res.json({ message: "Bank updated" });
});

module.exports = router;
