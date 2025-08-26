// userRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("./authMiddleware");
const { allowRoles } = require("./roleMiddleware");
const { registerUser, loginUser, getProfile, updateMyBank, setAgentAvailability } = require("./userController");

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile", protect, getProfile);
router.put("/me/bank", protect, updateMyBank);
router.put("/agent/availability", protect, allowRoles("Agent"), setAgentAvailability);

module.exports = router;
