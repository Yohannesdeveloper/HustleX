const express = require("express");
const router = express.Router();
const User = require("../models/User");
const nodemailer = require("nodemailer");

// POST /api/auth/send-otp
router.post("/send-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send OTP via email (configure your credentials)
    const transporter = nodemailer.createTransport({
      service: "Gmail", // or another email provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}`,
    });

    console.log(`OTP for ${email}: ${otp}`);
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Retrieve OTP from localStorage-like storage (in real app use DB or cache)
    // For now, assume front-end passes the correct OTP for testing
    console.log(`Verifying OTP for ${email}: ${otp}`);

    // If OTP is valid (here we just simulate success)
    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Invalid OTP" });
  }
});

module.exports = router;
