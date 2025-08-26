const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables
dotenv.config();

const userRoutes = require("./userRoutes");
const orderRoutes = require("./orderRoutes");
const payoutRoutes = require("./payouts");
const announcementRoutes = require("./announcements");
const adminRequestRoutes = require("./adminRequests");
const settingsRoutes = require("./settingsRoutes");

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
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    // Start server only after DB connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  });
