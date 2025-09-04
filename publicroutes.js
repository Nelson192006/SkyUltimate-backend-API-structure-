// publicroutes.js
const express = require("express");
const router = express.Router();
const Settings = require("./settings");
const User = require("./user");

// front-end uses this to decide which roles to show
router.get("/flags", async (req, res) => {
  try {
    const settings = await Settings.get();
    const userCount = await User.countDocuments();

    res.json({
      adminRegistrationEnabled: settings.adminRegistrationEnabled,
      allowSuperAdminRegistration: userCount === 0,
    });
  } catch (err) {
    console.error("flags error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// content for About/Mission/Vision/FAQ
router.get("/content", async (req, res) => {
  res.json({
    about:
      "Welcome to SkyUltimate Delivery Service, where we're dedicated to taking your delivery experience to new heights! Founded in 2024, our company was born from a simple idea: to create a delivery service that's not just fast and reliable, but also puts the customer first. We understand the importance of your packages, whether it's a crucial document for your business or a thoughtful gift for a loved one. That's why our team of dedicated professionals works tirelessly to ensure every item is handled with the utmost care and delivered on time, every time. At SkyUltimate, we're more than just a delivery company; we're your trusted partner in logistics.",
    mission:
      "Our mission at SkyUltimate Delivery Service is to provide a seamless, reliable, and efficient delivery experience that exceeds our customers' expectations. We are committed to leveraging innovative technology and exceptional customer service to simplify logistics for businesses and individuals alike. We strive to be the most trusted and preferred delivery service, one package at a time.",
    vision:
      "To be the industry leader in delivery services, known for our speed, reliability, and unwavering commitment to customer satisfaction. We envision a future where SkyUltimate Delivery Service is synonymous with excellence, setting the standard for logistics solutions and positively impacting the communities we serve.",
    faq: [
      { q: "How do I track my package?", a: "Use your tracking number on our tracking page for real-time updates." },
      { q: "What are your delivery hours?", a: "9:00 AM to 6:00 PM, Monday–Saturday. Contact support for urgent after-hours." },
      { q: "What items can you deliver?", a: "Documents, parcels, general goods. No hazardous/illegal items or live animals." },
      { q: "What if my package is lost or damaged?", a: "Contact support immediately. We will investigate and work on a solution." },
      { q: "How can I contact support?", a: "Phone, email, or chat on the website (see Contact Us page)." },
    ],
  });
});

module.exports = router;
