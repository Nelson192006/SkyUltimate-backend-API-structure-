// userController.js
const User = require("./User");
const Settings = require("./settings");
const jwt = require("jsonwebtoken");

const normalizeRole = (r) => {
  if (!r) return "Customer";
  const s = String(r).toLowerCase();
  if (s === "customer") return "Customer";
  if (s === "agent") return "Agent";
  if (s === "admin") return "Admin";
  if (s === "superadmin" || s === "super-admin" || s === "super_admin") return "SuperAdmin";
  return "Customer";
};

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });

// POST /api/users/register
const registerUser = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;
    role = normalizeRole(role);

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    // role gating
    if (role === "Admin") {
      const settings = await Settings.get();
      if (!settings.adminRegistrationEnabled) {
        return res.status(403).json({ message: "Admin registration is currently disabled" });
      }
    }
    if (role === "SuperAdmin") {
      const count = await User.countDocuments();
      if (count > 0) {
        return res.status(403).json({ message: "SuperAdmin can only be created for the first user" });
      }
    }

    const user = await User.create({ name, email, password, role });

    return res.status(201).json({
      message: "Registered",
      user: { _id: user.id, name: user.name, email: user.email, role: user.role },
      token: generateToken(user.id, user.role),
    });
  } catch (e) {
    console.error("Registration error:", e); // shows in Render logs
    return res.status(500).json({ message: e.message || "Server error" });
  }
};

// POST /api/users/login
const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body; // role optional
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });
    if (user.isSuspended) return res.status(403).json({ message: "Account suspended" });

    const ok = await user.matchPassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

    if (role && normalizeRole(role) !== user.role) {
      return res.status(401).json({ message: "Role mismatch for this account" });
    }

    return res.json({
      message: "Login successful",
      user: { _id: user.id, name: user.name, email: user.email, role: user.role },
      token: generateToken(user.id, user.role),
    });
  } catch (e) {
    console.error("Login error:", e);
    return res.status(500).json({ message: e.message || "Server error" });
  }
};

// GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (e) {
    console.error("Get profile error:", e);
    return res.status(500).json({ message: e.message || "Server error" });
  }
};

// PUT /api/users/me/bank
const updateMyBank = async (req, res) => {
  try {
    const { bankName, accountNumber, accountHolderName, phone } = req.body || {};
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (bankName || accountNumber || accountHolderName) {
      user.bankDetails = { bankName, accountNumber, accountHolderName };
    }
    if (phone) user.phone = phone;

    await user.save();
    res.json({ message: "Profile updated" });
  } catch (e) {
    console.error("Update bank error:", e);
    return res.status(500).json({ message: e.message || "Server error" });
  }
};

// PUT /api/users/agent/availability
const setAgentAvailability = async (req, res) => {
  try {
    if (req.user.role !== "Agent")
      return res.status(403).json({ message: "Only agents can toggle availability" });

    const { online } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { isAvailable: !!online },
      { new: true }
    );
    res.json({ online: updated.isAvailable });
  } catch (e) {
    console.error("Agent availability error:", e);
    return res.status(500).json({ message: e.message || "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateMyBank,
  setAgentAvailability,
};
