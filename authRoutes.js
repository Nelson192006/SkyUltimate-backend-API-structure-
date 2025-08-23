const express = require("express");
const router = express.Router();
const User = require("../models/user");
const {
  hashPassword,
  comparePassword,
  generateToken,
} = require("../models/helper");
const { validateEmail, validatePassword } = require("../models/validation");

// @route   POST /api/auth/register
// @desc    Register new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ msg: "Invalid email format" });
    }
    if (!validatePassword(password)) {
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters" });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "customer",
    });

    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      msg: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
