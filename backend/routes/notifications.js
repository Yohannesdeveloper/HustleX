const express = require("express");
const router = express.Router();
const { sendMail, isEmailConfigured } = require("../services/mail");

router.post("/email", async (req, res) => {
  const { to, subject, body } = req.body;

  if (!to || !subject || !body) {
    return res
      .status(400)
      .json({ message: "Missing required fields: to, subject, body" });
  }

  if (!isEmailConfigured()) {
    return res.status(200).json({
      message: "Email service not configured. Notification skipped.",
      skipped: true,
    });
  }

  try {
    const result = await sendMail({
      to,
      subject,
      text: body,
      html: `<p>${body}</p>`,
    });
    res.status(200).json({
      message: result.queued ? "Email queued successfully" : "Email sent successfully",
      ...result,
    });
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    res.status(200).json({
      message: "Email notification failed but application status was updated",
      error: error.message,
      warning: true,
    });
  }
});

module.exports = router;
