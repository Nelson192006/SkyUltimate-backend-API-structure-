const express = require("express");
const User = require("./user");

const router = express.Router();

// Get all admins
router.get("/admins", async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle admin registration availability
let allowAdminRegistration = true;

router.post("/toggle-admin-registration", (req, res) => {
  allowAdminRegistration = !allowAdminRegistration;
  res.json({ allowAdminRegistration });
});

// Get status
router.get("/admin-registration-status", (req, res) => {
  res.json({ allowAdminRegistration });
});

module.exports = router;
