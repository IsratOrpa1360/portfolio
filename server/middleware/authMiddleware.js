/**
 * server/middleware/authMiddleware.js
 * Manages server-side session tokens signed with HMAC-SHA256 using SESSION_SECRET.
 * Configures HttpOnly, SameSite=Strict, and Secure (in production) session cookies.
 */

'use strict';

const crypto = require('crypto');
const { getSessionSecret, NODE_ENV } = require('../config/env');

const COOKIE_NAME = 'orpa_admin_sid';
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const activeSessions = new Map(); // sessionId -> { csrfToken, createdAt, expiresAt }

function signSessionId(sessionId) {
  const secret = getSessionSecret();
  if (!secret) throw new Error('SESSION_SECRET is not configured');
  const sig = crypto.createHmac('sha256', secret).update(sessionId).digest('hex');
  return `${sessionId}.${sig}`;
}

function verifySignedToken(signedToken) {
  const secret = getSessionSecret();
  if (!secret || !signedToken || typeof signedToken !== 'string') return null;
  const dotIdx = signedToken.indexOf('.');
  if (dotIdx === -1) return null;
  const sessionId = signedToken.slice(0, dotIdx);
  const providedSig = signedToken.slice(dotIdx + 1);
  const expectedSig = crypto.createHmac('sha256', secret).update(sessionId).digest('hex');
  if (providedSig.length !== expectedSig.length) return null;
  const valid = crypto.timingSafeEqual(Buffer.from(providedSig), Buffer.from(expectedSig));
  return valid ? sessionId : null;
}

function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  for (const pair of cookieHeader.split(';')) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const k = pair.slice(0, idx).trim();
    const v = pair.slice(idx + 1).trim();
    out[k] = decodeURIComponent(v);
  }
  return out;
}

function createSession(res) {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const csrfToken = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  activeSessions.set(sessionId, {
    csrfToken,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS
  });

  const signed = signSessionId(sessionId);
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(signed)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`
  ];
  if (NODE_ENV === 'production') {
    parts.push('Secure');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
  return { sessionId, csrfToken };
}

function getSessionFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  const raw = cookies[COOKIE_NAME];
  const sessionId = verifySignedToken(raw);
  if (!sessionId) return null;
  const record = activeSessions.get(sessionId);
  if (!record) return null;
  if (Date.now() > record.expiresAt) {
    activeSessions.delete(sessionId);
    return null;
  }
  return { sessionId, ...record };
}

function destroySession(req, res) {
  const cookies = parseCookies(req.headers.cookie || '');
  const raw = cookies[COOKIE_NAME];
  const sessionId = verifySignedToken(raw);
  if (sessionId) {
    activeSessions.delete(sessionId);
  }
  const parts = [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=0'
  ];
  if (NODE_ENV === 'production') {
    parts.push('Secure');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

module.exports = {
  createSession,
  getSessionFromRequest,
  destroySession
};
