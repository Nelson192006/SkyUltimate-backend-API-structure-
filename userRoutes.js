getProfileerllersstes/userRoutes.js
const express = require("express");
const { registerUser, loginUser, getProfile } = require("../contmiddlewaret { authMiddleware } = require("../authMiddleware");

const router = express.Router();

// Register
router.post("/register", registerUserregisterUser
router.post("/login", loginUser);
loginUserle (protected)
router.get("/profile", authMiddleware, getProfile);

module.exports = router;
