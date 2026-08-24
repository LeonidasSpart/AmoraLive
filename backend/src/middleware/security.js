const crypto = require('crypto');

function getClientIp(req) {
  return req.ip || String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
}

function createRateLimiter({ windowMs = 60_000, max = 600, keyPrefix = 'api' } = {}) {
  const buckets = new Map();
  let lastCleanup = Date.now();

  return (req, res, next) => {
    const now = Date.now();
    if (now - lastCleanup > Math.min(windowMs, 60_000)) {
      for (const [key, value] of buckets) {
        if (value.resetAt <= now) buckets.delete(key);
      }
      lastCleanup = now;
    }

    const key = `${keyPrefix}:${getClientIp(req)}`;
    const current = buckets.get(key);
    const bucket = !current || current.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : current;

    bucket.count += 1;
    buckets.set(key, bucket);

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - bucket.count)));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))));
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
