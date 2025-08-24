const express = require("express");
const { registerUser, loginUser, getProfile } = require("./userController");
const { protect } = require("./authMiddleware");   // ✅ use protect

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Profile (protected)
router.get("/profile", protect, getProfile);   // ✅ use protect

module.exports = router;
