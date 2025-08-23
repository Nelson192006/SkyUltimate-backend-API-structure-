// src/routes/userRoutes.js
const express = require("express");
const { registerUser, loginUser, getProfile } = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Profile (protected)
router.get("/profile", authMiddleware, getProfile);

module.exports = router;