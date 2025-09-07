// authroutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./user"); // ensure single user.js in root (lowercase)

const router = express.Router();

// Normalize role to canonical capitalization used in DB
const normalizeRole = (role) => {
  if (!role) return "Customer";
  const s = String(role).toLowerCase().replace(/[\s_-]+/g, "");
  if (s === "customer") return "Customer";
  if (s === "agent") return "Agent";
  if (s === "admin") return "Admin";
  if (s === "superadmin" || s === "super-admin" || s === "super_admin") return "SuperAdmin";
  return "Customer";
};

const getBankDetailsFromBody = (body = {}) => {
  if (body.bankDetails && typeof body.bankDetails === "object") return body.bankDetails;
  const { bankName, accountNumber, accountHolderName } = body;
  if (bankName || accountNumber || accountHolderName) {
    return { bankName, accountNumber, accountHolderName };
  }
  return undefined;
};

const makeToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

// ======================== REGISTER ========================
router.post("/register", async (req, res) => {
  try {
    console.log("➡️ /api/auth/register", {
      role: req.body?.role,
      email: req.body?.email,
      name: req.body?.name || req.body?.fullName,
    });

    let { name, fullName, email, password, role, phone } = req.body || {};
    name = name || fullName;
    role = normalizeRole(role);

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    email = String(email).toLowerCase().trim();
    name = String(name).trim();

    // unique email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(409).json({ message: "User already exists" });

    // unique name (case-insensitive)
    const existingName = await User.findOne({
      name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });
    if (existingName) return res.status(409).json({ message: "Name already taken, use a different name" });

    // SuperAdmin only if no users exist
    if (role === "SuperAdmin") {
      const count = await User.countDocuments();
      if (count > 0) {
        return res.status(403).json({ message: "SuperAdmin can only be created for the first registration" });
      }
    }

    // bank details required for Agent/Admin
    const bankDetails = getBankDetailsFromBody(req.body);
    if ((role === "Agent" || role === "Admin") && !bankDetails) {
      return res.status(400).json({ message: "Bank details required for Agents and Admins" });
    }
    const user = await User.create({
      name,
      email,
      password,      //raw password goes here
     role,
      phone,
      bankDetails,
    });

    console.log("✅ User registered:", { id: user._id.toString(), name: user.name, role: user.role });

    // return token + user to simplify frontend flows
    return res.status(201).json({
      message: "Registered. Please login.",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token: makeToken(user),
    });
  } catch (err) {
    console.error("🔥 Register error:", err && (err.stack || err.message || err));
    return res.status(500).json({ message: "Error registering user" });
  }
});

// ======================== LOGIN ========================
router.post("/login", async (req, res) => {
  try {
    console.log("➡️ /api/auth/login", { email: req.body?.email, name: req.body?.name || req.body?.fullName });

    const { email, name, fullName, password } = req.body || {};
    const loginName = name || fullName;

    if (!password || (!email && !loginName)) {
      return res.status(400).json({ message: "email or name, and password are required" });
    }

    let user = null;
    if (email && String(email).includes("@")) {
      user = await User.findOne({ email: String(email).toLowerCase().trim() });
    } else if (loginName) {
      const cleaned = String(loginName).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      user = await User.findOne({ name: { $regex: new RegExp(`^${cleaned}$`, "i") } });
    } else {
      return res.status(400).json({ message: "Invalid login parameters" });
    }

    if (!user) {
      console.log("❌ Login: user not found");
      return res.status(401).json({ message: "Invalid name or password" });
    }
    if (user.isSuspended) {
      console.log("⚠️ Suspended account login attempt:", user.name);
      return res.status(403).json({ message: "Account suspended" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      console.log("❌ Wrong password for user:", user.name);
      return res.status(401).json({ message: "Invalid name or password" });
    }

    const token = makeToken(user);
    console.log("✅ Login success:", { id: user._id.toString(), name: user.name, role: user.role });

    return res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("🔥 Login error:", err && (err.stack || err.message || err));
    return res.status(500).json({ message: "Error logging in" });
  }
});

module.exports = router;
