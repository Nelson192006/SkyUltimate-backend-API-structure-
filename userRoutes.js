const express = require("express");
const { registerUser, loginUser, getProfile } = require("./userController");
const { authMiddleware } = require("./authMiddleware");

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Profile (protected)
router.get("/profile", authMiddleware, getProfile);

module.exports = router;
