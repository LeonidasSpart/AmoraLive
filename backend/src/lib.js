const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, tier: user.membership_tier, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_TTL || '15m' }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { id: user.id, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_TTL || '7d' }
  );
}

function safeJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function newIdempotencyKey() {
  return crypto.randomUUID();
}

module.exports = { signAccessToken, signRefreshToken, safeJson, newIdempotencyKey };
