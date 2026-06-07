#!/usr/bin/env node
/**
 * Production readiness check + one-time setup (indexes).
 * Usage: node scripts/finalize-production.js [--indexes]
 */
require("dotenv").config();
const net = require("net");
const { validateScaleConfig } = require("../config/scale");
const { isS3Enabled } = require("../services/storage");
const { isQueueEnabled } = require("../lib/redis-config");

const runIndexes = process.argv.includes("--indexes");

function checkPort(host, port, timeout = 2000) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port, timeout }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

function parseRedisHost() {
  try {
    const url = new URL(process.env.REDIS_URL || "redis://localhost:6379");
    return { host: url.hostname || "localhost", port: parseInt(url.port, 10) || 6379 };
  } catch {
    return { host: "localhost", port: 6379 };
  }
}

async function main() {
  console.log("\n═══════════════════════════════════════");
  console.log("  HustleX Production Finalization");
  console.log("═══════════════════════════════════════\n");

  if (runIndexes) {
    const { spawnSync } = require("child_process");
    const result = spawnSync(process.execPath, ["scripts/optimize-indexes.js"], {
      cwd: require("path").join(__dirname, ".."),
      stdio: "inherit",
    });
    if (result.status !== 0) process.exit(result.status || 1);
    console.log("");
  }
  const checks = [];

  // Redis
  const redis = parseRedisHost();
  const redisUp = await checkPort(redis.host, redis.port);
  checks.push({
    name: "Redis",
    ok: redisUp,
    detail: redisUp ? `${redis.host}:${redis.port}` : "not reachable — run npm run scale:redis",
  });

  // Scale flags
  checks.push({
    name: "REDIS_ENABLED",
    ok: process.env.REDIS_ENABLED === "true",
    detail: process.env.REDIS_ENABLED === "true" ? "on" : "off",
  });
  checks.push({
    name: "QUEUE_ENABLED",
    ok: isQueueEnabled(),
    detail: isQueueEnabled() ? "on" : "off",
  });
  checks.push({
    name: "MESSAGE_ASYNC",
    ok: process.env.MESSAGE_ASYNC === "true",
    detail: process.env.MESSAGE_ASYNC || "false",
  });
  checks.push({
    name: "MongoDB URI",
    ok: Boolean(process.env.MONGODB_URI),
    detail: process.env.MONGODB_URI ? "configured" : "missing",
  });
  checks.push({
    name: "JWT_SECRET",
    ok: Boolean(process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32),
    detail: process.env.JWT_SECRET?.length >= 32 ? "strong enough" : "needs 32+ chars",
  });
  checks.push({
    name: "S3 uploads",
    ok: isS3Enabled(),
    detail: isS3Enabled() ? "enabled" : "local disk (add AWS keys for cloud)",
    optional: true,
  });
  checks.push({
    name: "SES email",
    ok: process.env.EMAIL_PROVIDER === "ses",
    detail: process.env.EMAIL_PROVIDER === "ses" ? "enabled" : "Gmail (use SES at scale)",
    optional: true,
  });

  const { warnings, errors, ok } = validateScaleConfig();
  for (const c of checks) {
    const icon = c.ok ? "✅" : c.optional ? "⚠️ " : "❌";
    console.log(`  ${icon} ${c.name}: ${c.detail}`);
  }

  if (warnings.length) {
    console.log("\nWarnings:");
    warnings.forEach((w) => console.log(`  ⚠️  ${w}`));
  }
  if (errors.length) {
    console.log("\nErrors:");
    errors.forEach((e) => console.log(`  ❌ ${e}`));
  }

  const requiredOk = checks.filter((c) => !c.optional).every((c) => c.ok);
  const ready = ok && requiredOk && redisUp;

  console.log("\n───────────────────────────────────────");
  if (ready) {
    console.log("✅ Local scale stack is ready.");
    console.log("\nStart (3 terminals):");
    console.log("  1. npm run scale:redis");
    console.log("  2. npm run dev:stable");
    console.log("  3. npm run worker");
    console.log("\nOr from project root: start-scale.bat");
    console.log("\nCloud deploy:");
    console.log("  docker compose -f docker-compose.prod.yml up -d --build");
    console.log("  docker compose -f docker-compose.prod.yml up -d --scale api=3 --scale worker=2");
    if (!isS3Enabled() || process.env.EMAIL_PROVIDER !== "ses") {
      console.log("\nAWS (last step for 1M-user cloud):");
      console.log("  1. Create IAM user with S3 + SES permissions");
      console.log("  2. Add keys to .env → npm run scale:aws");
      console.log("  3. Set S3_ENABLED=true, EMAIL_PROVIDER=ses");
    }
  } else {
    console.log("⚠️  Fix items above, then re-run: npm run scale:finalize");
    if (!redisUp) console.log("    Start Redis first: npm run scale:redis");
  }
  console.log("───────────────────────────────────────\n");

  process.exit(ready ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
