// AdminRequest.js
const mongoose = require("mongoose");

const adminRequestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // an Admin
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, enum: ["Suspend", "Delete"], required: true },
    reason: { type: String, default: "" },
    status: { type: String, enum: ["Pending", "Approved", "Denied"], default: "Pending" },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    decidedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminRequest", adminRequestSchema);
