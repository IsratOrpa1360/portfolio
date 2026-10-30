/**
 * server/routes/authRoutes.js
 * Handles `/api/auth/session`, `/api/auth/login`, and `/api/auth/logout`.
 * Never reveals sensitive hash/secret details in responses or logs.
 */

'use strict';

const { getAuthConfigStatus, verifyPasswordAgainstEnvHash } = require('../config/env');
const { createSession, getSessionFromRequest, destroySession } = require('../middleware/authMiddleware');
const { verifyCsrfToken } = require('../middleware/csrfMiddleware');
const {
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  clearLoginAttempts
} = require('../middleware/rateLimitMiddleware');

async function handleAuthRoutes(req, res, pathname, parseJsonBody, sendJson) {
  if (pathname === '/api/auth/session' && req.method === 'GET') {
    const configStatus = getAuthConfigStatus();
    const session = getSessionFromRequest(req);
    if (!session) {
      return sendJson(res, 200, {
        authenticated: false,
        serverConfigured: configStatus.isConfigured
      });
    }
    return sendJson(res, 200, {
      authenticated: true,
      csrfToken: session.csrfToken,
      serverConfigured: configStatus.isConfigured
    });
  }

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const configStatus = getAuthConfigStatus();
    if (!configStatus.isConfigured) {
      return sendJson(res, 503, {
        error: 'Server authentication is not configured. Set ADMIN_PASSWORD_HASH and SESSION_SECRET in .env.'
      });
    }

    const rate = checkLoginRateLimit(req);
    if (!rate.allowed) {
      res.setHeader('Retry-After', String(rate.retryAfterSeconds));
      return sendJson(res, 429, {
        error: `Too many login attempts. Please wait ${rate.retryAfterSeconds} seconds before trying again.`
      });
    }

    let body;
    try {
      body = await parseJsonBody(req);
    } catch (e) {
      return sendJson(res, 400, { error: 'Invalid request payload.' });
    }

    const password = body && typeof body.password === 'string' ? body.password : '';
    if (!password) {
      return sendJson(res, 400, { error: 'Password is required.' });
    }

    const verification = await verifyPasswordAgainstEnvHash(password);
    if (!verification.valid) {
      recordFailedLoginAttempt(req);
      return sendJson(res, 401, { error: 'Invalid credentials.' });
    }

    clearLoginAttempts(req);
    const session = createSession(res);
    return sendJson(res, 200, {
      authenticated: true,
      csrfToken: session.csrfToken
    });
  }

  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    const session = getSessionFromRequest(req);
    if (session && !verifyCsrfToken(req, session)) {
      return sendJson(res, 403, { error: 'Invalid CSRF token.' });
    }
    destroySession(req, res);
    return sendJson(res, 200, { authenticated: false });
  }

  return false;
}

module.exports = { handleAuthRoutes };
