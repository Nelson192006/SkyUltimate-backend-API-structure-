// PayoutLog.js
const mongoose = require("mongoose");

const payoutLogSchema = new mongoose.Schema(
  {
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // SuperAdmin
    agents: [
      {
        agent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        amount: { type: Number, required: true },
      }
    ],
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PayoutLog", payoutLogSchema);
