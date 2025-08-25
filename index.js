const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// import routes (must exist in root)
const userRoutes = require("./userRoutes.js");
const orderRoutes = require("./orderRoutes.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Root route for Render testing
app.get("/", (req, res) => {
  res.send("SkyUltimate API is running ✅");
});

// Routes
if (userRoutes) app.use("/api/users", userRoutes);
if (orderRoutes) app.use("/api/orders", orderRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`🚀 SkyUltimate API running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
