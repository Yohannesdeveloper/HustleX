const {
  emailQueue,
  notificationQueue,
  jobQueue,
  analyticsQueue,
  messageQueue,
} = require("./queues");
const { isQueueEnabled } = require("../lib/redis-config");
const { persistChatMessage } = require("./message-persist");

/**
 * Queue Helper Functions
 * Easy-to-use functions for adding jobs to queues
 */

// ================================
// Email Queue Helpers
// ================================
async function sendEmail({ to, subject, html, text, priority = "normal" }) {
  const job = await emailQueue.add(
    { to, subject, html, text },
    {
      priority: priority === "high" ? 10 : 5,
      delay: priority === "low" ? 60000 : 0, // Low priority: delay 1 minute
    }
  );

  console.log(`📧 Email job queued: ${job.id} -> ${to}`);
  return job;
}

async function sendBulkEmails(emails) {
  const jobs = await emailQueue.addBulk(
    emails.map(({ to, subject, html, text }) => ({
      name: "bulk-email",
      data: { to, subject, html, text },
    }))
  );

  console.log(`📧 Bulk email jobs queued: ${jobs.length} emails`);
  return jobs;
}

// ================================
// Notification Queue Helpers
// ================================
async function sendNotification({ userId, type, message, data }) {
  const job = await notificationQueue.add({
    userId,
    type,
    message,
    data,
  });

  console.log(`🔔 Notification queued for user ${userId}: ${type}`);
  return job;
}

async function broadcastNotification({ type, message, data, userIds }) {
  const jobs = await notificationQueue.addBulk(
    userIds.map(userId => ({
      name: "broadcast",
      data: { userId, type, message, data },
    }))
  );

  console.log(`🔔 Broadcast notification to ${jobs.length} users`);
  return jobs;
}

// ================================
// Job Queue Helpers
// ================================
async function postJobToTelegramQueue(jobId) {
  const job = await jobQueue.add({
    action: "post-to-telegram",
    jobId,
  });

  console.log(`💼 Telegram posting queued for job ${jobId}`);
  return job;
}

async function scheduleJobExpirationNotification(jobId, expirationDate) {
  const delay = expirationDate.getTime() - Date.now();
  
  const job = await jobQueue.add(
    {
      action: "send-job-expired-notification",
      jobId,
    },
    { delay: Math.max(0, delay) }
  );

  console.log(`💼 Job expiration notification scheduled for job ${jobId}`);
  return job;
}

// ================================
// Message Queue Helpers
// ================================
async function enqueueChatMessage(messageData) {
  const job = await messageQueue.add(messageData, { priority: 2 });
  return job;
}

/** Non-blocking: worker persists and emits newMessage to both users. */
function enqueueChatMessageAsync(messageData) {
  return enqueueChatMessage(messageData).catch((err) => {
    console.error("❌ Failed to enqueue chat message:", err.message);
    throw err;
  });
}

function isMessageAsyncEnabled() {
  return isQueueEnabled() && process.env.MESSAGE_ASYNC !== "false";
}

/**
 * Sync persist (inline) or blocking queue wait when MESSAGE_ASYNC=false.
 */
async function persistChatMessageQueued(messageData) {
  if (!isQueueEnabled()) {
    return persistChatMessage(messageData);
  }

  if (isMessageAsyncEnabled()) {
    await enqueueChatMessageAsync(messageData);
    return null;
  }

  const job = await enqueueChatMessage(messageData);
  const timeoutMs = parseInt(process.env.MESSAGE_QUEUE_TIMEOUT_MS, 10) || 8000;

  return Promise.race([
    job.finished(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Message queue timeout")), timeoutMs)
    ),
  ]);
}

// ================================
// Analytics Queue Helpers
// ================================
async function trackEvent({ event, data, userId }) {
  const job = await analyticsQueue.add(
    { event, data, userId },
    {
      priority: 1, // Low priority
      removeOnComplete: true, // Don't keep analytics jobs
    }
  );

  return job;
}

// ================================
// Queue Management
// ================================
async function getQueueStatus() {
  const stats = {
    email: {
      counts: await emailQueue.getJobCounts(),
      paused: await emailQueue.isPaused(),
    },
    notifications: {
      counts: await notificationQueue.getJobCounts(),
      paused: await notificationQueue.isPaused(),
    },
    jobs: {
      counts: await jobQueue.getJobCounts(),
      paused: await jobQueue.isPaused(),
    },
    analytics: {
      counts: await analyticsQueue.getJobCounts(),
      paused: await analyticsQueue.isPaused(),
    },
    messages: {
      counts: await messageQueue.getJobCounts(),
      paused: await messageQueue.isPaused(),
    },
  };

  return stats;
}

async function pauseQueue(queueName) {
  const queue = getQueueByName(queueName);
  if (queue) {
    await queue.pause();
    console.log(`⏸️  Queue paused: ${queueName}`);
  }
}

async function resumeQueue(queueName) {
  const queue = getQueueByName(queueName);
  if (queue) {
    await queue.resume();
    console.log(`▶️  Queue resumed: ${queueName}`);
  }
}

async function cleanQueue(queueName, gracePeriod = 3600000) {
  const queue = getQueueByName(queueName);
  if (queue) {
    await queue.clean(gracePeriod);
    console.log(`🧹 Queue cleaned: ${queueName}`);
  }
}

function getQueueByName(queueName) {
  const queues = {
    email: emailQueue,
    notifications: notificationQueue,
    jobs: jobQueue,
    analytics: analyticsQueue,
    messages: messageQueue,
  };
  return queues[queueName];
}

module.exports = {
  sendEmail,
  sendBulkEmails,
  sendNotification,
  broadcastNotification,
  postJobToTelegramQueue,
  scheduleJobExpirationNotification,
  enqueueChatMessage,
  enqueueChatMessageAsync,
  isMessageAsyncEnabled,
  persistChatMessageQueued,
  trackEvent,
  getQueueStatus,
  pauseQueue,
  resumeQueue,
  cleanQueue,
};
