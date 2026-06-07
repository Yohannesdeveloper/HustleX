const nodemailer = require("nodemailer");
const { isQueueEnabled } = require("../lib/redis-config");

let transporter = null;

function useSes() {
  return process.env.EMAIL_PROVIDER === "ses";
}

function getFromAddress() {
  return process.env.EMAIL_FROM || process.env.EMAIL_USER;
}

function getTransporter() {
  if (useSes()) {
    if (!process.env.AWS_ACCESS_KEY_ID) return null;
    if (!transporter) {
      const { SESClient } = require("@aws-sdk/client-ses");
      const ses = new SESClient({
        region: process.env.AWS_REGION || "us-east-1",
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
      transporter = nodemailer.createTransport({
        SES: { ses, aws: require("@aws-sdk/client-ses") },
      });
    }
    return transporter;
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

function isEmailConfigured() {
  if (useSes()) {
    const from = getFromAddress();
    return Boolean(from && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
  }
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) return false;
  if (user === "your-email@gmail.com" || pass === "your-app-password") return false;
  return true;
}

async function deliverMail({ to, subject, html, text }) {
  const transport = getTransporter();
  if (!transport) throw new Error("Email transport not configured");

  await transport.sendMail({
    from: `"HustleX" <${getFromAddress()}>`,
    to,
    subject,
    html,
    text: text || (html ? html.replace(/<[^>]+>/g, "") : ""),
  });
}

async function sendMail({ to, subject, html, text, priority = "normal" }) {
  if (!to || !isEmailConfigured()) {
    return { skipped: true, reason: "email_not_configured" };
  }

  const payload = {
    to,
    subject,
    html,
    text: text || (html ? html.replace(/<[^>]+>/g, "") : ""),
  };

  if (isQueueEnabled()) {
    const { sendEmail } = require("./queue-helpers");
    const job = await sendEmail({ ...payload, priority });
    return { queued: true, jobId: job.id };
  }

  await deliverMail(payload);
  return { sent: true };
}

function sendMailAsync(options) {
  sendMail(options).catch((err) => {
    console.error(`❌ sendMailAsync failed (${options.to}):`, err.message);
  });
}

module.exports = {
  sendMail,
  sendMailAsync,
  deliverMail,
  isEmailConfigured,
  getTransporter,
  useSes,
};
