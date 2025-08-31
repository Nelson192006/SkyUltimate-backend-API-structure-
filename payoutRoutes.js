// payoutRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("./authMiddleware");
const { allowRoles } = require("./roleMiddleware");
const Payout = require("./payout"); // you already have this model

// SuperAdmin: list pending agent payouts
router.get("/", protect, allowRoles("SuperAdmin"), async (req, res) => {
  const list = await Payout.find().sort({ createdAt: -1 });
  res.json(list);
});

// SuperAdmin: mark payout as paid
router.put("/:id/mark-paid", protect, allowRoles("SuperAdmin"), async (req, res) => {
  const p = await Payout.findById(req.params.id);
  if (!p) return res.status(404).json({ message: "Not found" });
  p.isPaid = true;
  p.paidAt = new Date();
  await p.save();
  res.json({ message: "Payout marked paid", payout: p });
});

module.exports = router;
