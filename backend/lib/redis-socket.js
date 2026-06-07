const Redis = require("ioredis");

let socketPubClient = null;
let socketSubClient = null;
let ready = false;
let lastErrorLog = 0;

function getRedisUrl() {
  return process.env.REDIS_URL || "redis://localhost:6379";
}

function createClient(name) {
  const client = new Redis(getRedisUrl(), {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: true,
    connectionName: `hustlex-${name}`,
    retryStrategy(times) {
      if (times > 8) return null;
      return Math.min(times * 400, 3000);
    },
  });

  client.on("error", (err) => {
    const now = Date.now();
    if (now - lastErrorLog < 8000) return;
    lastErrorLog = now;
    const detail = err?.message || err?.code || String(err);
    console.warn(
      `[Redis ${name}] ${detail} — start Redis: docker compose up redis -d`
    );
  });

  return client;
}

/**
 * Connect Redis for Socket.IO adapter + presence. Returns null clients if unavailable.
 */
async function initSocketRedis() {
  if (process.env.REDIS_ENABLED !== "true") {
    console.log("ℹ️  Socket.IO: in-memory adapter (REDIS_ENABLED=false)");
    return { pubClient: null, subClient: null, ready: false };
  }

  const pub = createClient("socket-pub");
  const sub = createClient("socket-sub");

  try {
    await Promise.race([
      Promise.all([pub.connect(), sub.connect()]),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("connection timeout after 4s")), 4000)
      ),
    ]);
    socketPubClient = pub;
    socketSubClient = sub;
    ready = true;
    console.log("✅ Redis connected (Socket.IO adapter + presence)");
    return { pubClient: pub, subClient: sub, ready: true };
  } catch (err) {
    try {
      pub.disconnect();
    } catch (_) {
      /* ignore */
    }
    try {
      sub.disconnect();
    } catch (_) {
      /* ignore */
    }
    socketPubClient = null;
    socketSubClient = null;
    ready = false;
    console.warn(`⚠️  Socket.IO: in-memory adapter — ${err.message}`);
    console.warn("   Queues/cache need Redis too. Run: docker compose up redis -d");
    return { pubClient: null, subClient: null, ready: false };
  }
}

function getSocketPubClient() {
  return ready ? socketPubClient : null;
}

function isSocketRedisReady() {
  return ready;
}

module.exports = {
  initSocketRedis,
  getSocketPubClient,
  isSocketRedisReady,
};
