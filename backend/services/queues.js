const Bull = require("bull");
const { getRedisConfig, isQueueEnabled } = require("../lib/redis-config");

const disabledQueue = {
  add: async () => ({ id: "queue-disabled", finished: async () => null }),
  addBulk: async () => [],
  getJobCounts: async () => ({
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
    delayed: 0,
    paused: 0,
  }),
  isPaused: async () => false,
  close: async () => {},
  pause: async () => {},
  resume: async () => {},
  clean: async () => 0,
};

function buildQueues() {
  const queueOptions = {
    redis: getRedisConfig(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
      removeOnComplete: 100,
      removeOnFail: 5000,
    },
  };

  const emailQueue = new Bull("email-queue", queueOptions);
  const notificationQueue = new Bull("notification-queue", queueOptions);
  const jobQueue = new Bull("job-queue", queueOptions);
  const analyticsQueue = new Bull("analytics-queue", queueOptions);
  const messageQueue = new Bull("message-queue", {
    ...queueOptions,
    defaultJobOptions: {
      ...queueOptions.defaultJobOptions,
      removeOnComplete: 200,
      attempts: 2,
    },
  });

  return {
    emailQueue,
    notificationQueue,
    jobQueue,
    analyticsQueue,
    messageQueue,
  };
}

const queues = isQueueEnabled() ? buildQueues() : {
  emailQueue: disabledQueue,
  notificationQueue: disabledQueue,
  jobQueue: disabledQueue,
  analyticsQueue: disabledQueue,
  messageQueue: disabledQueue,
};

module.exports = queues;
