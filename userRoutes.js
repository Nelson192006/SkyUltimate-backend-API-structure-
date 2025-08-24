const express = require("express");
const { registerUser, loginUser, getProfile } = require("./userController"); 
const { authMiddleware } = require("./authMiddleware");

const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Login a user
router.post("/login", loginUser);

// Get user profile (protected route)
router.get("/profile", authMiddleware, getProfile);

module.exports = router;
