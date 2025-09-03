// authroutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./user");

const router = express.Router();

// Normalize roles
const normalizeRole = (role) => {
  if (!role) return "Customer";
  const s = String(role).toLowerCase().replace(/[\s_-]+/g, "");
  if (s === "customer") return "Customer";
  if (s === "agent") return "Agent";
  if (s === "admin") return "Admin";
  if (s === "superadmin") return "SuperAdmin";
  return "Customer";
};

// Extract bank details
const getBankDetailsFromBody = (body = {}) => {
  if (body.bankDetails && typeof body.bankDetails === "object") return body.bankDetails;
  const { bankName, accountNumber, accountHolderName } = body;
  if (bankName || accountNumber || accountHolderName) {
    return { bankName, accountNumber, accountHolderName };
  }
  return undefined;
};

// ======================== REGISTER ========================
router.post("/register", async (req, res) => {
  try {
    console.log("➡️ Register request:", req.body);

    // accept either name or fullName
    let { name, fullName, email, password, role, phone } = req.body;
    name = name || fullName; 
    role = normalizeRole(role);

    if (!name || !email || !password) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ message: "name/fullName, email and password are required" });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      console.log("❌ Email already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    const existingName = await User.findOne({
      name: { $regex: new RegExp(`^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });
    if (existingName) {
      console.log("❌ Name already taken:", name);
      return res.status(400).json({ message: "Name already taken, use a different name" });
    }

    if (role === "SuperAdmin") {
      const userCount = await User.countDocuments();
      if (userCount > 0) {
        console.log("❌ SuperAdmin registration blocked - already exists");
        return res.status(403).json({ message: "SuperAdmin can only be created for the first registration" });
      }
    }

    const bankDetails = getBankDetailsFromBody(req.body);
    if ((role === "Agent" || role === "Admin") && !bankDetails) {
      console.log("❌ Missing bank details for role:", role);
      return res.status(400).json({ message: "Bank details required for Agents and Admins" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role,
      phone,
      bankDetails,
    });

    console.log("✅ User registered:", { id: user._id, role: user.role, name: user.name });

    return res.status(201).json({
      message: "Registered. Please login.",
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error("🔥 Register error:", err);
    return res.status(500).json({
      message: "Error registering user",
      error: err.message,
      stack: err.stack,
    });
  }
});

// ======================== LOGIN ========================
router.post("/login", async (req, res) => {
  try {
    console.log("➡️ Login request:", req.body);

    // accept either name or fullName
    const { name, fullName, password } = req.body;
    const loginName = name || fullName;

    if (!loginName || !password) {
      console.log("❌ Missing login fields");
      return res.status(400).json({ message: "name/fullName and password are required" });
    }

    const user = await User.findOne({
      name: { $regex: new RegExp(`^${loginName.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });

    if (!user) {
      console.log("❌ User not found:", loginName);
      return res.status(400).json({ message: "Invalid name or password" });
    }
    if (user.isSuspended) {
      console.log("⚠️ Suspended account login attempt:", loginName);
      return res.status(403).json({ message: "Account suspended" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      console.log("❌ Wrong password for user:", loginName);
      return res.status(400).json({ message: "Invalid name or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ User logged in:", { id: user._id, role: user.role, name: user.name });

    return res.json({
      message: "Login successful",
      token,
      role: user.role,
      name: user.name,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error("🔥 Login error:", err);
    return res.status(500).json({
      message: "Error logging in",
      error: err.message,
      stack: err.stack,
    });
  }
});

module.exports = router;
