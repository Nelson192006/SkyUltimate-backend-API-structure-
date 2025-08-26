// PayrollLog.js
const mongoose = require("mongoose");

const payrollLogSchema = new mongoose.Schema(
  {
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // SuperAdmin
    admins: [
      {
        admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        amount: { type: Number, required: true },
      }
    ],
    totalAmount: { type: Number, required: true },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PayrollLog", payrollLogSchema);
