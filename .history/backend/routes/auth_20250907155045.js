const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User"); // <- FIXED PATH
const auth = require("../middleware/auth");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs"); // <- needed for password hashing

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ---------------------
// OTP Routes for Password Reset
// ---------------------

// POST /api/auth/send-otp
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Save OTP in user document
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
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
    console.error("Error in send-otp:", err);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP required" });

    const user = await User.findOne({ email });
    if (!user || !user.otp || !user.otpExpires)
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.otp !== otp || user.otpExpires < new Date())
      return res.status(400).json({ message: "OTP expired or invalid" });

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("Error in verify-otp:", err);
    return res.status(500).json({ message: "Failed to verify OTP" });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res
        .status(400)
        .json({ message: "Email, OTP, and new password required" });

    const user = await User.findOne({ email });
    if (!user || !user.otp || !user.otpExpires)
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.otp !== otp || user.otpExpires < new Date())
      return res.status(400).json({ message: "OTP expired or invalid" });

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Error in reset-password:", err);
    return res.status(500).json({ message: "Failed to reset password" });
  }
});

module.exports = router;
