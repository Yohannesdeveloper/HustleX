/**
 * @deprecated Import from ./queues.js and run workers/queue-worker.js separately.
 * Re-exported for backward compatibility.
 */
const queues = require("./queues");
const { getQueueStats, shutdown } = require("./queue-stats");

module.exports = {
  ...queues,
  getQueueStats,
  shutdown,
};
