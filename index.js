// index.js

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables
dotenv.config();

// Import routes (all lowercase filenames)
const userRoutes = require("./userRoutes");
const orderRoutes = require("./order");          // lowercase
const payoutRoutes = require("./payout");        // lowercase
const announcementRoutes = require("./announcement"); // lowercase
const adminRequestRoutes = require("./adminRequest"); // lowercase
const settingsRoutes = require("./settingsRoutes");   // lowercase

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payouts", payoutRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/admin-requests", adminRequestRoutes);
app.use("/api/settings", settingsRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("SkyUltimate Delivery API is running...");
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  });
