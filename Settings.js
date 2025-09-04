const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    adminRegistrationEnabled: { type: Boolean, default: false },
    commissionRateAgent: { type: Number, default: 0.7 },
    bankDetails: {
      bankName: { type: String, default: "Your Bank" },
      accountNumber: { type: String, default: "0000000000" },
      accountHolderName: { type: String, default: "SkyUltimate" },
    },
  },
  { timestamps: true }
);

settingsSchema.statics.get = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({});
  return doc;
};

module.exports = mongoose.model("settings", settingsSchema);
