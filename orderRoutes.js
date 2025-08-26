// orderRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("./authMiddleware");
const { allowRoles } = require("./roleMiddleware");
const {
  calcPrice,
  createOrder,
  confirmPayment,
  claimOrder,
  confirmPickedUp,
  confirmDelivered,
  rateAgent,
} = require("./orderController");

// Customer
router.post("/calc-price", protect, allowRoles("Customer"), calcPrice);
router.post("/", protect, allowRoles("Customer"), createOrder);
router.post("/:id/rate", protect, allowRoles("Customer"), rateAgent);

// Admin / SuperAdmin
router.put("/:id/confirm-payment", protect, allowRoles("Admin", "SuperAdmin"), confirmPayment);

// Agent
router.post("/:id/claim", protect, allowRoles("Agent"), claimOrder);
router.put("/:id/pickup", protect, allowRoles("Agent"), confirmPickedUp);
router.put("/:id/deliver", protect, allowRoles("Agent"), confirmDelivered);

module.exports = router;
