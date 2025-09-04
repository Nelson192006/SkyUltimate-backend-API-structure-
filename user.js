// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["Customer", "Agent", "Admin", "SuperAdmin"],
      default: "Customer",
    },
    phone: { type: String, trim: true },
    bankDetails: {
      bankName: String,
      accountNumber: String,
      accountHolderName: String,
    },
    isSuspended: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: false }, // for agents
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    pendingPayout: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// compare password
userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", userSchema);
