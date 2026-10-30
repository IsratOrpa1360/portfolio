/**
 * server/middleware/rateLimitMiddleware.js
 * Protects the admin login endpoint against brute-force password guessing.
 */

'use strict';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;
const attemptsByIp = new Map(); // ip -> { count, resetAt }

function getClientIp(req) {
  return (req.socket && req.socket.remoteAddress) || '127.0.0.1';
}

function checkLoginRateLimit(req) {
  const ip = getClientIp(req);
  const now = Date.now();
  const entry = attemptsByIp.get(ip);
  if (!entry || now > entry.resetAt) {
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (entry.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000)
    };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

function recordFailedLoginAttempt(req) {
  const ip = getClientIp(req);
  const now = Date.now();
  const entry = attemptsByIp.get(ip);
  if (!entry || now > entry.resetAt) {
    attemptsByIp.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function clearLoginAttempts(req) {
  const ip = getClientIp(req);
  attemptsByIp.delete(ip);
}

module.exports = {
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  clearLoginAttempts
};
