// orderRoutes.js
const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} = require("./orderController");

// @route   POST /orders
// @desc    Create a new order
router.post("/", createOrder);

// @route   GET /orders
// @desc    Get all orders
router.get("/", getOrders);

// @route   GET /orders/:id
// @desc    Get order by ID
router.get("/:id", getOrderById);

// @route   PUT /orders/:id
// @desc    Update order status
router.put("/:id", updateOrderStatus);

// @route   DELETE /orders/:id
// @desc    Delete order
router.delete("/:id", deleteOrder);

module.exports = router;
