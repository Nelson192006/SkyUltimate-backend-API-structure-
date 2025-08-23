// src/index.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

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