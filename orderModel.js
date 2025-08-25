const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["Awaiting Payment", "In Transit", "Delivered", "Paid"],
      default: "Awaiting Payment",
    },
    price: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
