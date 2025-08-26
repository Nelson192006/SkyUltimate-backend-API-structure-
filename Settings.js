const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    allowAdminRegistration: { type: Boolean, default: false }, // Super Admin toggle
    commissionRateAgent: { type: Number, default: 0.7 },       // 70% to agent
    bankDetails: {
      bankName: { type: String, default: "Your Bank" },
      accountNumber: { type: String, default: "0000000000" },
      accountHolderName: { type: String, default: "SkyUltimate" },
    },
    announcementMessage: { type: String, default: "" },        // Super Admin announcement
  },
  { timestamps: true }
);

// Ensure single document exists
settingsSchema.statics.get = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({});
  return doc;
};

module.exports = mongoose.model("Settings", settingsSchema);
