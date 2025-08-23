const express = require("express");
const { registerUser, loginUser, getProfile } = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Get user profile (protected)
router.get("/profile", authMiddleware, getProfile);

module.exports = router;
