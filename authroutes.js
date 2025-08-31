// authroutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./user");

const router = express.Router();

const normalizeRole = (role) => {
  if (!role) return "Customer";
  const s = String(role).toLowerCase().replace(/[\s_-]+/g, "");
  if (s === "customer") return "Customer";
  if (s === "agent") return "Agent";
  if (s === "admin") return "Admin";
  if (s === "superadmin") return "SuperAdmin";
  return "Customer";
};

// helper: build bankDetails from either nested or flat fields
const getBankDetailsFromBody = (body = {}) => {
  if (body.bankDetails && typeof body.bankDetails === "object") return body.bankDetails;
  const { bankName, accountNumber, accountHolderName } = body;
  if (bankName || accountNumber || accountHolderName) {
    return { bankName, accountNumber, accountHolderName };
  }
  return undefined;
};

// Register (SuperAdmin allowed only if first user)
router.post("/register", async (req, res) => {
  try {
    let { name, email, password, role, phone } = req.body;
    role = normalizeRole(role);

    // basic required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    // enforce unique email and name (case-insensitive)
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) return res.status(400).json({ message: "User already exists" });

    const existingName = await User.findOne({
      name: { $regex: new RegExp(`^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });
    if (existingName) return res.status(400).json({ message: "Name already taken, use a different name" });

    // SuperAdmin allowed only if this is the very first user
    if (role === "SuperAdmin") {
      const userCount = await User.countDocuments();
      if (userCount > 0) {
        return res.status(403).json({ message: "SuperAdmin can only be created for the first registration" });
      }
    }

    // bank details required for Agent/Admin
    const bankDetails = getBankDetailsFromBody(req.body);
    if ((role === "Agent" || role === "Admin") && !bankDetails) {
      return res.status(400).json({ message: "Bank details required for Agents and Admins" });
    }

    // create user
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role,
      phone,
      bankDetails,
    });

    return res.status(201).json({
      message: "Registered. Please login.",
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Error registering user" });
  }
});

// Login (by name + password)
router.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) return res.status(400).json({ message: "name and password are required" });

    // case-insensitive exact match on name
    const user = await User.findOne({
      name: { $regex: new RegExp(`^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });

    if (!user) return res.status(400).json({ message: "Invalid name or password" });
    if (user.isSuspended) return res.status(403).json({ message: "Account suspended" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid name or password" });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      role: user.role,
      name: user.name,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Error logging in" });
  }
});

module.exports = router;
