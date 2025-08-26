const mongoose = require("mongoose");

const adminRequestSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    actionType: { type: String, enum: ["Suspend", "Delete"], required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Denied"], default: "Pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("adminrequest", adminRequestSchema);
