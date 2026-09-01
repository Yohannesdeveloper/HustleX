const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { sendMail, sendMailAsync } = require('../services/mail');

const contactValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('subject').trim().isLength({ min: 5, max: 200 }).withMessage('Subject must be between 5 and 200 characters'),
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters')
];

router.post('/', contactValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, subject, message } = req.body;
    const adminTo = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    await sendMail({
      to: adminTo,
      subject: `HustleX Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0891b2;">New Contact Form Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p style="line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
        </div>
      `,
    });

    sendMailAsync({
      to: email,
      subject: 'Thank you for contacting HustleX',
      html: `
        <p>Dear ${name},</p>
        <p>Thank you for reaching out. We have received your message and will get back to you within 24 hours.</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p>Best regards,<br>The HustleX Team</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Message sent successfully! We'll get back to you soon."
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
});

module.exports = router;
