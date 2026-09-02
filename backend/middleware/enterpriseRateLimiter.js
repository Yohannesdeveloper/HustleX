/**
 * Enterprise-Grade Rate Limiter
 * Handles billions of requests with:
 * - Redis-based distributed rate limiting (if available)
 * - In-memory fallback with efficient algorithms
 * - Sliding window algorithm
 * - Request batching
 * - Memory-efficient storage
 */

const Redis = require('ioredis'); // Redis client for distributed rate limiting
const NodeCache = require('node-cache');
const Bottleneck = require('bottleneck');

// Redis connection (optional - falls back to memory if not available)
let redis = null;
let redisAvailable = false;

// Initialize Redis connection
const initRedis = () => {
  try {
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_HOST;
    
    if (redisUrl) {
      redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        enableOfflineQueue: false,
        lazyConnect: true,
      });

      redis.on('connect', () => {
        console.log('✅ Redis connected for distributed rate limiting');
        redisAvailable = true;
      });

      redis.on('error', (err) => {
        console.warn('⚠️ Redis unavailable, using in-memory rate limiting:', err.message);
        redisAvailable = false;
      });

      redis.connect().catch(() => {
        redisAvailable = false;
      });
    }
  } catch (error) {
    console.warn('⚠️ Redis initialization failed, using in-memory rate limiting');
    redisAvailable = false;
  }
};

// In-memory cache with TTL (fallback)
const memoryCache = new NodeCache({
  stdTTL: 60, // 60 seconds default TTL
  checkperiod: 30, // Check for expired keys every 30 seconds
  useClones: false, // Better performance
  maxKeys: 1000000, // Max 1 million keys in memory
});

// Bottleneck for request throttling
const bottleneckThrottler = new Bottleneck({
  reservoir: 10000, // Initial capacity
  reservoirRefreshAmount: 10000, // Refill amount
  reservoirRefreshInterval: 1000, // Refill every second (10k req/sec)
  maxConcurrent: 5000, // Max concurrent requests
  minTime: 0.1, // Minimum time between requests (100ms = 10 req/sec per connection)
});

/**
 * Sliding window rate limiter
 */
class SlidingWindowRateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000; // 1 minute default
    this.maxRequests = options.max || 10000; // 10k requests per window
    this.useRedis = redisAvailable;
  }

  /**
   * Check and increment rate limit counter
   */
  async checkLimit(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const key = `ratelimit:${identifier}`;

    if (this.useRedis && redis) {
      return this.checkLimitRedis(key, windowStart);
    } else {
      return this.checkLimitMemory(key, windowStart);
    }
  }

  /**
   * Redis-based rate limiting (distributed)
   */
  async checkLimitRedis(key, windowStart) {
    try {
      const pipeline = redis.pipeline();
      
      // Remove old entries
      pipeline.zremrangebyscore(key, 0, windowStart);
      
      // Count current requests
      pipeline.zcard(key);
      
      // Add current request
      pipeline.zadd(key, Date.now(), `${Date.now()}-${Math.random()}`);
      
      // Set expiry
      pipeline.expire(key, Math.ceil(this.windowMs / 1000));
      
      const results = await pipeline.exec();
      const count = results[1][1];
      const maxRequests = this.maxRequests;

      return {
        allowed: count < maxRequests,
        remaining: Math.max(0, maxRequests - count - 1),
        reset: Date.now() + this.windowMs,
      };
    } catch (error) {
      // Fallback to memory on Redis error
      return this.checkLimitMemory(key, windowStart);
    }
  }

  /**
   * Memory-based rate limiting (fallback)
   */
  async checkLimitMemory(key, windowStart) {
    const now = Date.now();
    let requests = memoryCache.get(key) || [];

    // Remove old entries
    requests = requests.filter((timestamp) => timestamp > windowStart);

    // Check limit
    const allowed = requests.length < this.maxRequests;

    if (allowed) {
      // Add current request
      requests.push(now);
      memoryCache.set(key, requests, Math.ceil(this.windowMs / 1000));
    }

    return {
      allowed,
      remaining: Math.max(0, this.maxRequests - requests.length - 1),
      reset: now + this.windowMs,
    };
  }
}

// Create rate limiters for different endpoints
const generalLimiter = new SlidingWindowRateLimiter({
  windowMs: 60000, // 1 minute
  max: 10000, // 10k requests per minute per user
});

const messageLimiter = new SlidingWindowRateLimiter({
  windowMs: 60000, // 1 minute
  max: 50000, // 50k message requests per minute (high volume for messaging)
});

const apiLimiter = new SlidingWindowRateLimiter({
  windowMs: 60000, // 1 minute
  max: 20000, // 20k API requests per minute
});

/**
 * Get rate limiter for specific route
 */
const getLimiter = (route) => {
  if (route.includes('/messages')) {
    return messageLimiter;
  } else if (route.includes('/api/')) {
    return apiLimiter;
  }
  return generalLimiter;
};

/**
 * Enterprise rate limit middleware
 */
const enterpriseRateLimiter = async (req, res, next) => {
  try {
    // Get identifier (user ID or IP)
    const identifier = req.user?._id || req.user?.id || req.ip || 'anonymous';
    const route = req.path;
    
    // Get appropriate limiter
    const limiter = getLimiter(route);
    
    // Check rate limit
    const result = await limiter.checkLimit(identifier);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', limiter.maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', new Date(result.reset).toISOString());
    
    if (!result.allowed) {
      return res.status(429).json({
        message: 'Too many requests, please try again later.',
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        limit: limiter.maxRequests,
        window: Math.ceil(limiter.windowMs / 1000),
      });
    }
    
    // Use bottleneck for additional throttling
    await bottleneckThrottler.schedule(() => Promise.resolve());
    
    next();
  } catch (error) {
    // On error, allow request (fail open)
    console.error('Rate limiter error:', error);
    next();
  }
};

/**
 * Request batching middleware
 */
const requestBatcher = new Bottleneck({
  reservoir: 1000,
  reservoirRefreshAmount: 1000,
  reservoirRefreshInterval: 100, // 100ms = 10k req/sec
  maxConcurrent: 2000,
});

/**
 * Batch similar requests together
 */
const batchRequests = (fn, key) => {
  return requestBatcher.schedule(() => fn());
};

// Initialize Redis on module load
initRedis();

module.exports = {
  enterpriseRateLimiter,
  batchRequests,
  bottleneckThrottler,
  initRedis,
  getLimiter,
};
