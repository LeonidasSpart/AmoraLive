const crypto = require('crypto');
const Redis = require('ioredis');

function getClientIp(req) {
  return req.ip || String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
}

// A single shared Redis connection for all rate limiters. Without this,
// every limiter is a plain in-process Map, which stops protecting anything
// the moment the backend scales past one instance — each instance would
// keep its own separate counters, so limits become trivially bypassable
// by round-robining requests across instances.
let sharedRedisClient = null;
function getRateLimiterRedis() {
  if (!process.env.REDIS_URL) return null;
  if (!sharedRedisClient) {
    // Same connection options as the app's own pub/sub Redis clients in
    // index.js, which connect reliably. enableOfflineQueue:false was tried
    // here initially to "fail fast," but it instead makes every command
    // throw hard whenever the connection is anything other than fully
    // ready (including brief reconnects) — the default (queue commands
    // until connected) is what's actually proven to work in this app.
    sharedRedisClient = new Redis(process.env.REDIS_URL, {
      retryStrategy: (times) => (times > 5 ? null : Math.min(times * 100, 3000))
    });
    sharedRedisClient.on('error', (err) => {
      console.warn('Rate-limiter Redis error:', err.message);
    });
    sharedRedisClient.on('connect', () => {
      console.log('✅ Rate-limiter Redis connected');
    });
  }
  return sharedRedisClient;
}

function createRateLimiter({ windowMs = 60_000, max = 600, keyPrefix = 'api' } = {}) {
  // In-memory fallback, used only when REDIS_URL isn't configured
  // (e.g. local development) — not safe across multiple instances.
  const buckets = new Map();
  let lastCleanup = Date.now();

  return async (req, res, next) => {
    const key = `ratelimit:${keyPrefix}:${getClientIp(req)}`;
    const redis = getRateLimiterRedis();
    const now = Date.now();
    let count;
    let resetAt;

    if (redis) {
      try {
        count = await redis.incr(key);
        if (count === 1) {
          await redis.pexpire(key, windowMs);
          resetAt = now + windowMs;
        } else {
          const ttl = await redis.pttl(key);
          resetAt = now + (ttl > 0 ? ttl : windowMs);
        }
      } catch (err) {
        // Fail open: a Redis blip should not take down the whole API.
        console.error('Rate limiter Redis error, allowing request:', err.message);
        return next();
      }
    } else {
      if (now - lastCleanup > Math.min(windowMs, 60_000)) {
        for (const [k, v] of buckets) {
          if (v.resetAt <= now) buckets.delete(k);
        }
        lastCleanup = now;
      }
      const current = buckets.get(key);
      const bucket = !current || current.resetAt <= now
        ? { count: 0, resetAt: now + windowMs }
        : current;
      bucket.count += 1;
      buckets.set(key, bucket);
      count = bucket.count;
      resetAt = bucket.resetAt;
    }

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - count)));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));

    if (count > max) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((resetAt - now) / 1000))));
      return res.status(429).json({
        error: 'Too many requests. Please try again shortly.',
        code: 'RATE_LIMITED'
      });
    }

    next();
  };
}

function requestSecurityMiddleware(req, res, next) {
  const requestId = crypto.randomUUID();
  req.requestId = requestId;
  req.clientIp = getClientIp(req);
  res.setHeader('X-Request-ID', requestId);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=(self), payment=(self)');
  next();
}

function noStore(req, res, next) {
  res.setHeader('Cache-Control', 'no-store');
  next();
}

module.exports = {
  getClientIp,
  createRateLimiter,
  requestSecurityMiddleware,
  noStore
};
