// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./authroutes");
const adminRoutes = require("./adminroutes");
const superAdminRoutes = require("./superadminroutes");
const orderRoutes = require("./orderroutes");
const publicRoutes = require("./publicroutes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/public", publicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/orders", orderRoutes);

// Health
app.get("/", (req, res) => {
  res.send("SkyUltimate Backend API Running ✅");
});

// Ensure unknown /api/* returns JSON (prevents HTML responses)
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: "Not found" });
  }
  next();
});

// Global error handler (JSON only)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Server error", error: err.message });
});

// MongoDB connection (specify DB name)
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "SkyUltimateDB",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected to SkyUltimateDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
