const {
  emailQueue,
  notificationQueue,
  jobQueue,
  analyticsQueue,
  messageQueue,
} = require("./queues");
const { isQueueEnabled } = require("../lib/redis-config");

async function getQueueStats() {
  if (!isQueueEnabled()) {
    return { enabled: false };
  }
  return {
    enabled: true,
    email: await emailQueue.getJobCounts(),
    notifications: await notificationQueue.getJobCounts(),
    jobs: await jobQueue.getJobCounts(),
    analytics: await analyticsQueue.getJobCounts(),
    messages: await messageQueue.getJobCounts(),
  };
}

async function shutdown() {
  if (!isQueueEnabled()) return;
  await Promise.all([
    emailQueue.close(),
    notificationQueue.close(),
    jobQueue.close(),
    analyticsQueue.close(),
    messageQueue.close(),
  ]);
}

module.exports = { getQueueStats, shutdown };
