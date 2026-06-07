#!/usr/bin/env node
/**
 * Start a local Redis instance when Docker/Memurai is not available (Windows dev).
 * Usage: node scripts/start-redis.js
 */
const fs = require("fs");
const path = require("path");
const RedisMemoryServer = require("redis-memory-server").default;

const PORT_FILE = path.join(__dirname, "..", ".redis-port");

async function main() {
  const server = new RedisMemoryServer({
    instance: { port: 6379 },
    autoStart: true,
  });

  const host = await server.getHost();
  const port = await server.getPort();
  fs.writeFileSync(PORT_FILE, String(port));

  console.log(`✅ Redis running at redis://${host}:${port}`);
  console.log("   Press Ctrl+C to stop");

  const shutdown = async () => {
    try {
      await server.stop();
    } catch (_) {
      /* ignore */
    }
    try {
      fs.unlinkSync(PORT_FILE);
    } catch (_) {
      /* ignore */
    }
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("Failed to start Redis:", err.message);
  process.exit(1);
});
