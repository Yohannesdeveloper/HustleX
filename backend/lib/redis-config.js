/**
 * Shared Redis connection settings for Bull, cache, rate limits, and Socket.IO.
 * Prefer REDIS_URL (e.g. redis://:password@host:6379/0).
 */
function getRedisConfig() {
  const url = process.env.REDIS_URL || "redis://localhost:6379";
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname || "localhost",
      port: parseInt(parsed.port, 10) || 6379,
      password: parsed.password || process.env.REDIS_PASSWORD || undefined,
      db: parsed.pathname ? parseInt(parsed.pathname.replace("/", ""), 10) || 0 : 0,
    };
  } catch {
    return {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    };
  }
}

function isRedisConfigured() {
  return Boolean(process.env.REDIS_URL || process.env.REDIS_HOST);
}

function isQueueEnabled() {
  return process.env.QUEUE_ENABLED === "true" && isRedisConfigured();
}

module.exports = { getRedisConfig, isRedisConfigured, isQueueEnabled };
