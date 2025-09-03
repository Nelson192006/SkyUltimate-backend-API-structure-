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
  console.log("➡️ Register endpoint hit! Body:", req.body);
  try {
    let { name, email, password, role, phone } = req.body;
    console.log("📌 Step 1: Extracted fields:", { name, email, role, phone });

    role = normalizeRole(role);
    console.log("📌 Step 2: Normalized role:", role);

    if (!name || !email || !password) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ message: "name, email and password are required" });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    console.log("📌 Step 3: Existing email check:", existingEmail ? "FOUND" : "NOT FOUND");

    if (existingEmail) {
      return res.status(400).json({ message: "User already exists" });
    }

    const existingName = await User.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });
    console.log("📌 Step 4: Existing name check:", existingName ? "FOUND" : "NOT FOUND");

    if (existingName) {
      return res.status(400).json({ message: "Name already taken, use a different name" });
    }

    if (role === "SuperAdmin") {
      const userCount = await User.countDocuments();
      console.log("📌 Step 5: User count (for SuperAdmin check):", userCount);
      if (userCount > 0) {
        return res.status(403).json({ message: "SuperAdmin can only be created for the first registration" });
      }
    }

    const bankDetails = getBankDetailsFromBody(req.body);
    console.log("📌 Step 6: Bank details:", bankDetails);

    if ((role === "Agent" || role === "Admin") && !bankDetails) {
      return res.status(400).json({ message: "Bank details required for Agents and Admins" });
    }

    const hashed = await bcrypt.hash(password, 10);
    console.log("📌 Step 7: Password hashed");

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role,
      phone,
      bankDetails,
    });
    console.log("✅ Step 8: User created:", { id: user._id, role: user.role, name: user.name });

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
  console.log("➡️ Login endpoint hit! Body:", req.body);
  try {
    const { name, password } = req.body;
    console.log("📌 Step 1: Extracted login fields:", { name });

    if (!name || !password) {
      return res.status(400).json({ message: "name and password are required" });
    }

    const user = await User.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });
    console.log("📌 Step 2: User lookup result:", user ? "FOUND" : "NOT FOUND");

    if (!user) {
      return res.status(400).json({ message: "Invalid name or password" });
    }

    if (user.isSuspended) {
      return res.status(403).json({ message: "Account suspended" });
    }

    const ok = await bcrypt.compare(password, user.password);
    console.log("📌 Step 3: Password match:", ok);

    if (!ok) {
      return res.status(400).json({ message: "Invalid name or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    console.log("✅ Step 4: Token generated for user:", user.name);

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
