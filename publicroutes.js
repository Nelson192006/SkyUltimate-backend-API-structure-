// publicroutes.js
const express = require("express");
const User = require("./user");

const router = express.Router();

// Frontend can call this to decide whether to show "Super Admin" in the signup dropdown
router.get("/flags", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.json({
      allowSuperAdminRegistration: userCount === 0, // show only if first user
      adminRegistrationEnabled: true,               // open sign-up for Admins
    });
  } catch (e) {
    console.error("flags error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
