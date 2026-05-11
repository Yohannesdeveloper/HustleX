const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Or your email service
  auth: {
    user: process.env.EMAIL_USER, // .env email
    pass: process.env.EMAIL_PASS, // .env app password
  },
});

// POST /api/notifications/email
router.post("/email", async (req, res) => {
  const { to, subject, body } = req.body;

  // Validate request body
  if (!to || !subject || !body) {
    return res
      .status(400)
      .json({ message: "Missing required fields: to, subject, body" });
  }

  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || 
      process.env.EMAIL_USER === 'your-email@gmail.com' || 
      process.env.EMAIL_PASS === 'your-app-password') {
    console.warn("⚠️ Email credentials not configured. Email notifications disabled.");
    return res.status(200).json({ 
      message: "Email service not configured. Notification skipped.",
      skipped: true 
    });
  }

  try {
    await transporter.sendMail({
      from: `"HustleX" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: body,
      html: `<p>${body}</p>`,
    });
    console.log(`✅ Email sent successfully to ${to}`);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    // Return 200 with warning instead of 500 to not break the application flow
    res.status(200).json({ 
      message: "Email notification failed but application status was updated",
      error: error.message,
      warning: true
    });
  }
});

module.exports = router;
