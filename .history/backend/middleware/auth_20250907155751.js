const express = require("express");
const router = express.Router();
const User = require("../models/User");
const nodemailer = require("nodemailer"); // if using nodemailer

// POST /api/auth/send-otp
router.post("/send-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Optional: check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send OTP via email
    // Example using nodemailer:
    /*
    const transporter = nodemailer.createTransport({
      service: "Gmail",
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
    */

    // For now, just log OTP (or you can implement real email)
    console.log(`OTP for ${email}: ${otp}`);

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
});

module.exports = router;
