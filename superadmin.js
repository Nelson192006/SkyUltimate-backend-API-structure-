// checkSuperAdmin.js
const express = require("express");
const router = express.Router();
const User = require("./user");

// GET /check-for-super-admin
router.get("/check-for-super-admin", async (req, res) => {
  try {
    const superAdmin = await User.findOne({ role: "SuperAdmin" }); // use correct casing
    res.json({ exists: !!superAdmin });
  } catch (err) {
    console.error("check-for-super-admin error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
