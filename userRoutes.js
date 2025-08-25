const express = require("express");
const { registerUser, loginUser, getProfile } = require("./userController.js"); 
const { protect } = require("./authMiddleware.js"); // add .js explicitly

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Profile (protected)
router.get("/profile", protect, getProfile);

module.exports = router;
