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

  try {
    await transporter.sendMail({
      from: `"HustleX" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: body,
      html: `<p>${body}</p>`,
    });
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res
      .status(500)
      .json({ message: "Failed to send email", error: error.message });
  }
});

module.exports = router;
