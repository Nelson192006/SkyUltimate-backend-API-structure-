// authroutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./user"); // make sure there is exactly one user.js in root (lowercase)

const router = express.Router();

// normalize incoming role to canonical capitalization used in DB
const normalizeRole = (role) => {
  if (!role) return "Customer";
  const s = String(role).toLowerCase().replace(/[\s_-]+/g, "");
  if (s === "customer") return "Customer";
  if (s === "agent") return "Agent";
  if (s === "admin") return "Admin";
  if (s === "superadmin") return "SuperAdmin";
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

// helper to create JWT
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
    console.log("➡️ /api/auth/register", req.body && { role: req.body.role, email: req.body.email, name: req.body.name });

    let { name, email, password, role, phone } = req.body || {};
    role = normalizeRole(role);

    // required
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    // normalize values
    email = String(email).toLowerCase().trim();
    name = String(name).trim();

    // ensure unique email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(409).json({ message: "User already exists" });

    // ensure name uniqueness (case-insensitive)
    const existingName = await User.findOne({
      name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });
    if (existingName) return res.status(409).json({ message: "Name already taken, use a different name" });

    // SuperAdmin can only be created if no users exist
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

    // create user (bcrypt)
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      phone,
      bankDetails,
    });

    console.log("✅ User registered:", { id: user._id.toString(), name: user.name, role: user.role });

    return res.status(201).json({
      message: "Registered. Please login.",
      user: { id: user._id, name: user.name, role: user.role },
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
    console.log("➡️ /api/auth/login", req.body && { email: req.body.email, name: req.body.name });

    const { email, name, password } = req.body || {};
    if (!password || (!email && !name)) {
      return res.status(400).json({ message: "email or name, and password are required" });
    }

    // decide whether we search by email or name
    let user = null;
    if (email && String(email).includes("@")) {
      user = await User.findOne({ email: String(email).toLowerCase().trim() });
    } else if (name) {
      // case-insensitive exact match on full name
      const cleaned = String(name).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
