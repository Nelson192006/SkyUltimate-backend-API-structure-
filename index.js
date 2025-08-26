const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const userRoutes = require("./userRoutes");
const orderRoutes = require("./order");
const payoutRoutes = require("./payout");
const announcementRoutes = require("./announcement");
const adminRequestRoutes = require("./adminRequest");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payouts", payoutRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/admin-requests", adminRequestRoutes);

app.get("/", (req, res) => {
  res.send("SkyUltimate Delivery API is running...");
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
});
