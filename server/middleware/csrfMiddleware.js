/**
 * server/middleware/csrfMiddleware.js
 * Validates the X-CSRF-Token header against the active session's CSRF token
 * in constant time for all state-changing requests (POST, PUT, DELETE).
 */

'use strict';

const crypto = require('crypto');

function verifyCsrfToken(req, session) {
  if (!session || !session.csrfToken) return false;
  const headerToken = (req.headers['x-csrf-token'] || '').trim();
  if (!headerToken || headerToken.length !== session.csrfToken.length) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(headerToken, 'utf8'),
    Buffer.from(session.csrfToken, 'utf8')
  );
}

module.exports = { verifyCsrfToken };
