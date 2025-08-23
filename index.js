// index.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userController = require("./userController"); // ✅ No folders

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.post("/api/register", userController.registerUser);
app.post("/api/login", userController.loginUser);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
