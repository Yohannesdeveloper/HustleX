const { isRedisConfigured, isQueueEnabled } = require("../lib/redis-config");
const { isS3Enabled } = require("../services/storage");

function isProductionScaleMode() {
  return process.env.NODE_ENV === "production";
}

/**
 * Apply recommended defaults when deploying with NODE_ENV=production.
 */
function applyScaleDefaults() {
  if (process.env.NODE_ENV !== "production") return;
  if (process.env.SCALE_MODE === "development") return;

  const defaults = {
    REDIS_ENABLED: "true",
    QUEUE_ENABLED: "true",
    MESSAGE_ASYNC: "true",
    MONGO_MAX_POOL_SIZE: process.env.MONGO_MAX_POOL_SIZE || "100",
    MONGO_MIN_POOL_SIZE: process.env.MONGO_MIN_POOL_SIZE || "10",
  };

  for (const [key, value] of Object.entries(defaults)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function validateScaleConfig() {
  applyScaleDefaults();

  const warnings = [];
  const errors = [];

  if (isProductionScaleMode()) {
    if (!isRedisConfigured()) {
      errors.push("REDIS_URL is required in production scale mode");
    }
    if (process.env.REDIS_ENABLED !== "true") {
      warnings.push("Set REDIS_ENABLED=true for shared cache and rate limits");
    }
    if (!isQueueEnabled()) {
      warnings.push("Set QUEUE_ENABLED=true and run `npm run worker` for background jobs");
    }
    if (!isS3Enabled()) {
      warnings.push("Set S3_ENABLED=true for uploads when running multiple API pods");
    }
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      errors.push("JWT_SECRET must be at least 32 characters in production");
    }
  }

  return { warnings, errors, ok: errors.length === 0 };
}

function logScaleStatus() {
  const { warnings, errors, ok } = validateScaleConfig();

  console.log("═══════════════════════════════════════");
  console.log("  HustleX scale configuration");
  console.log(`  Mode: ${process.env.SCALE_MODE || process.env.NODE_ENV || "development"}`);
  console.log(`  Redis: ${process.env.REDIS_ENABLED === "true" ? "on" : "off"}`);
  console.log(`  Queues: ${isQueueEnabled() ? "on (requires worker)" : "off"}`);
  console.log(`  S3 uploads: ${isS3Enabled() ? "on" : "local"}`);
  console.log(`  Message async: ${process.env.MESSAGE_ASYNC !== "false" && isQueueEnabled() ? "on" : "off"}`);
  console.log("═══════════════════════════════════════");

  warnings.forEach((w) => console.warn(`⚠️  ${w}`));
  if (!ok) {
    errors.forEach((e) => console.error(`❌ ${e}`));
    if (process.env.SCALE_STRICT === "true") {
      console.error("SCALE_STRICT=true — exiting");
      process.exit(1);
    }
  }
}

module.exports = {
  applyScaleDefaults,
  validateScaleConfig,
  logScaleStatus,
  isProductionScaleMode,
};
