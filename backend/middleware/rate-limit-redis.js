/**
 * Shared Redis store for express-rate-limit.
 *
 * Without this, each pod maintains its own in-memory window, meaning:
 *   - 10 pods × 100 req/window = 1000 effective req/window per IP (10× too permissive)
 *
 * With this store every pod reads/writes the same Redis keys, giving accurate
 * distributed rate limiting across the entire fleet.
 *
 * Falls back gracefully to no-op store if Redis is unavailable, preserving
 * in-process behaviour rather than crashing.
 */

const Redis = require('ioredis');

class RedisRateLimitStore {
  constructor(options = {}) {
    this.prefix = options.prefix || 'rl:';
    this.client = options.client || null;

    if (!this.client) {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      if (process.env.REDIS_ENABLED === 'true') {
        this.client = new Redis(redisUrl, {
          maxRetriesPerRequest: 1,
          enableReadyCheck: false,
          lazyConnect: true,
          connectionName: 'hustlex-ratelimit',
        });
        this.client.on('error', (err) => {
          // Non-fatal — fall back to pass-through on Redis errors
          if (process.env.NODE_ENV !== 'test') {
            console.warn('[RateLimit Redis] store error (degraded to no-op):', err.message);
          }
        });
      }
    }
  }

  /**
   * Returns the key for a given identifier (IP address).
   */
  _key(key) {
    return `${this.prefix}${key}`;
  }

  /**
   * Increment the counter for `key` within a `windowMs` window.
   * Called by express-rate-limit on every request.
   *
   * @returns {{ totalHits: number, resetTime: Date }}
   */
  async increment(key) {
    const rKey = this._key(key);
    const windowMs = this.windowMs || 15 * 60 * 1000;
    const windowSecs = Math.ceil(windowMs / 1000);

    try {
      if (this.client && this.client.status === 'ready') {
        // Atomic increment + set expiry only on first hit
        const pipeline = this.client.pipeline();
        pipeline.incr(rKey);
        pipeline.pttl(rKey);
        const [[, hits], [, pttl]] = await pipeline.exec();

        // Set TTL on first hit (incr returns 1)
        if (hits === 1 || pttl === -1) {
          await this.client.expire(rKey, windowSecs);
        }

        const ttlMs = pttl > 0 ? pttl : windowMs;
        return {
          totalHits: hits,
          resetTime: new Date(Date.now() + ttlMs),
        };
      }
    } catch (err) {
      console.warn('[RateLimit Redis] increment failed, using fallback:', err.message);
    }

    // Fallback: in-process counting (single pod only, better than crashing)
    if (!this._local) this._local = new Map();
    const now = Date.now();
    const entry = this._local.get(key) || { hits: 0, resetAt: now + windowMs };
    if (now > entry.resetAt) {
      entry.hits = 0;
      entry.resetAt = now + windowMs;
    }
    entry.hits += 1;
    this._local.set(key, entry);
    return { totalHits: entry.hits, resetTime: new Date(entry.resetAt) };
  }

  /**
   * Decrement on successful requests (when skipSuccessfulRequests is true).
   */
  async decrement(key) {
    const rKey = this._key(key);
    try {
      if (this.client && this.client.status === 'ready') {
        await this.client.decr(rKey);
        return;
      }
    } catch { /* non-fatal */ }

    if (this._local) {
      const entry = this._local.get(key);
      if (entry) entry.hits = Math.max(0, entry.hits - 1);
    }
  }

  /**
   * Reset the counter for `key` (used by express-rate-limit internals).
   */
  async resetKey(key) {
    const rKey = this._key(key);
    try {
      if (this.client && this.client.status === 'ready') {
        await this.client.del(rKey);
        return;
      }
    } catch { /* non-fatal */ }

    if (this._local) this._local.delete(key);
  }
}

/**
 * Factory — creates a pre-configured store instance.
 *
 * Usage in server.js:
 *   const { createRateLimitStore } = require('./middleware/rate-limit-redis');
 *   const globalLimiter = rateLimit({ store: createRateLimitStore('global'), ... });
 */
function createRateLimitStore(prefix = 'global') {
  return new RedisRateLimitStore({ prefix: `rl:${prefix}:` });
}

module.exports = { RedisRateLimitStore, createRateLimitStore };
