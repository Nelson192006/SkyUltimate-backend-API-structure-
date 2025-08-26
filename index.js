// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const userRoutes = require("./userRoutes");
const orderRoutes = require("./orderRoutes");
const publicRoutes = require("./publicRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// health/root
app.get("/", (req, res) => res.send("SkyUltimate API is running ✅"));

// mount routes
app.use("/api/public", publicRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

// connect DB then start server
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server listening on :${PORT}`));
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
})();
