const Redis = require("ioredis");
const { LRUCache } = require("lru-cache");

// L1 Cache: In-memory (per instance, fastest)
const memoryCache = new LRUCache({
  max: 500, // Max 500 items
  ttl: 1000 * 60 * 5, // 5 minutes
  updateAgeOnGet: true,
});

// L2 Cache: Redis (shared across instances)
let redisClient = null;
let cacheRedisGaveUp = false;
let lastCacheRedisErrorLog = 0;

function initializeRedis() {
  if (redisClient) return redisClient;
  if (cacheRedisGaveUp) return null;

  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  const redisEnabled = process.env.REDIS_ENABLED === "true";

  if (!redisEnabled) {
    console.log("ℹ️  Redis cache off (REDIS_ENABLED=false)");
    return null;
  }

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 2) {
          cacheRedisGaveUp = true;
          return null;
        }
        return Math.min(times * 300, 1500);
      },
      enableReadyCheck: true,
      connectionName: "hustlex-api",
      lazyConnect: true,
    });

    redisClient.on("error", (err) => {
      const now = Date.now();
      if (now - lastCacheRedisErrorLog < 10000) return;
      lastCacheRedisErrorLog = now;
      const detail = err.message || err.code || "connection failed";
      console.warn(`⚠️  Redis cache: ${detail} (set REDIS_ENABLED=false if Redis is not installed)`);
    });

    redisClient.on("connect", () => {
      console.log("✅ Redis cache connected");
    });

    redisClient.connect().catch((err) => {
      cacheRedisGaveUp = true;
      console.warn(
        "⚠️  Redis cache unavailable:",
        err.code || err.message,
        "— use REDIS_ENABLED=false for local dev without Redis"
      );
      try {
        redisClient.disconnect();
      } catch (_) {
        /* ignore */
      }
      redisClient = null;
    });

    return redisClient;
  } catch (error) {
    console.error("Failed to initialize Redis:", error.message);
    return null;
  }
}

// Get cache (L1 → L2 fallback)
async function getCache(key) {
  try {
    // Try L1 cache first (fastest)
    const memoryResult = memoryCache.get(key);
    if (memoryResult) {
      return memoryResult;
    }

    // Try L2 cache (Redis)
    if (redisClient) {
      const redisResult = await redisClient.get(key);
      if (redisResult) {
        const parsed = JSON.parse(redisResult);
        memoryCache.set(key, parsed); // Store in L1 for next time
        return parsed;
      }
    }

    return null;
  } catch (error) {
    console.error("Cache GET error:", error.message);
    return null;
  }
}

// Set cache (L1 + L2)
async function setCache(key, value, ttl = 300) {
  try {
    // Store in L1 cache
    memoryCache.set(key, value);

    // Store in L2 cache (Redis)
    if (redisClient) {
      await redisClient.setex(key, ttl, JSON.stringify(value));
    }
  } catch (error) {
    console.error("Cache SET error:", error.message);
  }
}

// Delete cache (single key)
async function deleteCache(key) {
  try {
    memoryCache.delete(key);
    if (redisClient) {
      await redisClient.del(key);
    }
  } catch (error) {
    console.error("Cache DELETE error:", error.message);
  }
}

// Invalidate cache by pattern (Redis only)
// Uses SCAN instead of KEYS to avoid blocking the Redis event loop at scale
async function invalidatePattern(pattern) {
  try {
    if (redisClient) {
      let cursor = '0';
      let totalDeleted = 0;

      do {
        const [nextCursor, keys] = await redisClient.scan(
          cursor,
          'MATCH', pattern,
          'COUNT', 100
        );
        cursor = nextCursor;

        if (keys.length > 0) {
          await redisClient.del(...keys);
          totalDeleted += keys.length;
        }
      } while (cursor !== '0');

      if (totalDeleted > 0) {
        console.log(`🗑️  Invalidated ${totalDeleted} cache keys matching: ${pattern}`);
      }
    }

    // Clear L1 cache (pattern matching in LRU is O(n) anyway, full clear is safer)
    memoryCache.clear();
  } catch (error) {
    console.error('Cache invalidation error:', error.message);
  }
}

// Cache middleware for Express routes
function cacheMiddleware(ttl = 300) {
  return async (req, res, next) => {
    // Skip cache for non-GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Skip cache if user is authenticated (user-specific data)
    if (req.user) {
      return next();
    }

    // Generate cache key from URL
    const cacheKey = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedData = await getCache(cacheKey);
      if (cachedData) {
        res.setHeader("X-Cache", "HIT");
        return res.json(cachedData);
      }

      // Override res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        // Cache successful responses
        if (res.statusCode === 200) {
          setCache(cacheKey, body, ttl);
          res.setHeader("X-Cache", "MISS");
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error.message);
      next(); // Continue without caching on error
    }
  };
}

module.exports = {
  initializeRedis,
  getCache,
  setCache,
  deleteCache,
  invalidatePattern,
  cacheMiddleware,
  memoryCache,
  redisClient: () => redisClient,
};
