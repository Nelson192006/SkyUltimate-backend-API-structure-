// Settings.js
const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    adminRegistrationEnabled: { type: Boolean, default: false }, // Super Admin can toggle this
    commissionRateAgent: { type: Number, default: 0.7 },         // 70% to agent on delivery
    bankDetails: {
      bankName: { type: String, default: "Your Bank" },
      accountNumber: { type: String, default: "0000000000" },
      accountHolderName: { type: String, default: "SkyUltimate" },
    },
  },
  { timestamps: true }
);

// always have a single doc
settingsSchema.statics.get = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({});
  return doc;
};

module.exports = mongoose.model("Settings", settingsSchema);
