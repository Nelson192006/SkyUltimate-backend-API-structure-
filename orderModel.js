// orderModel.js
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: String,
    quantity: Number,
    price: Number, // optional (if you precompute)
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [itemSchema],
    pickupAddress: String,
    deliveryAddress: String,
    paymentMethod: { type: String, enum: ["Cash", "Card", "Bank Transfer"], default: "Bank Transfer" },
    status: {
      type: String,
      enum: [
        "PendingPayment",        // after price calc, awaiting admin confirm
        "PaymentConfirmed",      // admin confirms, job can be claimed
        "EnRouteToPickup",
        "EnRouteToDelivery",
        "Completed",
        "Cancelled",
      ],
      default: "PendingPayment",
    },
    finalPrice: { type: Number, default: 0 },
    agentRating: { type: Number, min: 1, max: 5 },
    agentComment: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
