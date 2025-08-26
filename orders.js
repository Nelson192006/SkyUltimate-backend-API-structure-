const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    itemType: { type: String, required: true },
    weight: { type: Number, required: true },
    pickupAddress: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    pricePaid: { type: Number, default: 0 },
    agentRevenue: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["PendingPaymentConfirmation", "PaymentConfirmed", "PickedUp", "Delivered", "Cancelled"],
      default: "PendingPaymentConfirmation",
    },
    paymentConfirmedAt: { type: Date },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("order", orderSchema);
