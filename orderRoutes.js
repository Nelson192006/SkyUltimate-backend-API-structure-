constiddlewareiddlewarec/routes/orderRoutes.js
const express = require("express");
const { createOrder, getUserOrders, updateOrderStatus } = require("../controllers/orderController");
const { authMiddleware } = require("../authMiddleware");

const router = express.Router();

// Create order
router.post("/", authMiddleware, createOrder);

// Get user orders
router.get("/", authMiddleware, getUserOrders);

// Update order status
router.put("/:id", authMiddleware, updateOrderStatus);

module.exports = router;
