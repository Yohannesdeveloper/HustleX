#!/usr/bin/env node
/**
 * Background worker — run separately from API pods at scale.
 *   npm run worker
 *
 * Processes: email, notifications, Telegram posts, analytics.
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const connectDB = require("../config/database");
connectDB();

const {
  emailQueue,
  notificationQueue,
  jobQueue,
  analyticsQueue,
  messageQueue,
} = require("../services/queues");
const { persistChatMessage } = require("../services/message-persist");
const { deliverMail, isEmailConfigured } = require("../services/mail");
const { getIO } = require("../services/realtime");

console.log("🚀 HustleX queue worker starting...");

emailQueue.process(async (job) => {
  const { to, subject, html, text } = job.data;
  if (!isEmailConfigured()) {
    throw new Error("Email not configured");
  }
  await deliverMail({ to, subject, html, text });
  console.log(`✅ Email sent to ${to}`);
  return { success: true, to };
});

notificationQueue.process(async (job) => {
  const { userId, type, message, data } = job.data;
  const io = getIO();
  if (io) {
    io.to(`user:${userId}`).emit("notification", {
      type,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }
  return { success: true, userId };
});

jobQueue.process(async (job) => {
  const { action, jobId, data } = job.data;
  switch (action) {
    case "post-to-telegram": {
      const postJobToTelegram = require("../postToTelegram");
      const Job = require("../models/Job");
      const doc = await Job.findById(jobId);
      if (doc) await postJobToTelegram(doc);
      break;
    }
    default:
      console.warn(`Unknown job action: ${action}`);
  }
  return { success: true, action, jobId };
});

analyticsQueue.process(async (job) => {
  const { event, userId } = job.data;
  if (process.env.NODE_ENV !== "production") {
    console.log(`📊 ${event}`, userId || "anonymous");
  }
  return { success: true };
});

messageQueue.process(20, async (job) => {
  const { clientMessageId, ...payload } = job.data;
  const messageData = await persistChatMessage(payload);
  const io = getIO();
  if (io) {
    const enriched = { ...messageData, clientMessageId: clientMessageId || null };
    const receiverId = String(payload.receiverId);
    const senderId = String(payload.senderId);
    io.to(`user:${receiverId}`).emit("newMessage", enriched);
    io.to(`user:${senderId}`).emit("newMessage", enriched);
  }
  return messageData;
});

[emailQueue, notificationQueue, jobQueue, analyticsQueue, messageQueue].forEach((q) => {
  q.on("failed", (job, err) => {
    console.error(`❌ ${q.name} job ${job?.id} failed:`, err.message);
  });
});

async function shutdown() {
  console.log("🛑 Shutting down queue worker...");
  await Promise.all([
    emailQueue.close(),
    notificationQueue.close(),
    jobQueue.close(),
    analyticsQueue.close(),
    messageQueue.close(),
  ]);
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

console.log("✅ Queue worker ready (email, notifications, jobs, messages, analytics)");
