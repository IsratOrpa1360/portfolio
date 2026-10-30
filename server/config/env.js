/**
 * server/config/env.js
 * Loads private environment variables from `.env` (in local dev) or process.env.
 * Fails securely when ADMIN_PASSWORD_HASH or SESSION_SECRET is missing or left
 * as a placeholder. Never falls back to a default password.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PLACEHOLDER_HASH = 'replace_with_a_secure_password_hash';
const PLACEHOLDER_SECRET = 'replace_with_a_long_random_secret';

function loadDotEnvFile() {
  const envPath = path.resolve(__dirname, '../../.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let val = line.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

loadDotEnvFile();

function getAuthConfigStatus() {
  const hash = (process.env.ADMIN_PASSWORD_HASH || '').trim();
  const secret = (process.env.SESSION_SECRET || '').trim();

  const hashValid =
    hash.length > 20 &&
    hash !== PLACEHOLDER_HASH &&
    (hash.startsWith('scrypt$') || hash.startsWith('$argon2') || hash.startsWith('$2b$') || hash.startsWith('$2a$'));

  const secretValid =
    secret.length >= 32 &&
    secret !== PLACEHOLDER_SECRET;

  return {
    isConfigured: hashValid && secretValid,
    hashValid,
    secretValid
  };
}

/**
 * Verifies a candidate password against ADMIN_PASSWORD_HASH in constant time.
 * Supports `scrypt$N$r$p$saltHex$hashHex` out of the box using Node's native
 * crypto module, and optional `argon2` or `bcrypt` hashes if installed.
 */
async function verifyPasswordAgainstEnvHash(candidatePassword) {
  const status = getAuthConfigStatus();
  if (!status.isConfigured) {
    return { configured: false, valid: false };
  }
  if (typeof candidatePassword !== 'string' || candidatePassword.length === 0 || candidatePassword.length > 256) {
    return { configured: true, valid: false };
  }

  const storedHash = process.env.ADMIN_PASSWORD_HASH.trim();

  if (storedHash.startsWith('scrypt$')) {
    const parts = storedHash.split('$');
    if (parts.length !== 6) return { configured: true, valid: false };
    const N = parseInt(parts[1], 10);
    const r = parseInt(parts[2], 10);
    const p = parseInt(parts[3], 10);
    const salt = Buffer.from(parts[4], 'hex');
    const expectedKey = Buffer.from(parts[5], 'hex');
    if (!N || !r || !p || salt.length < 8 || expectedKey.length < 32) {
      return { configured: true, valid: false };
    }
    const derived = crypto.scryptSync(candidatePassword, salt, expectedKey.length, { N, r, p });
    const match = crypto.timingSafeEqual(derived, expectedKey);
    return { configured: true, valid: match };
  }

  if (storedHash.startsWith('$argon2')) {
    try {
      const argon2 = require('argon2');
      const match = await argon2.verify(storedHash, candidatePassword);
      return { configured: true, valid: Boolean(match) };
    } catch (e) {
      return { configured: true, valid: false };
    }
  }

  if (storedHash.startsWith('$2b$') || storedHash.startsWith('$2a$')) {
    try {
      const bcrypt = require('bcrypt');
      const match = await bcrypt.compare(candidatePassword, storedHash);
      return { configured: true, valid: Boolean(match) };
    } catch (e) {
      return { configured: true, valid: false };
    }
  }

  return { configured: true, valid: false };
}

module.exports = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  getAuthConfigStatus,
  verifyPasswordAgainstEnvHash,
  getSessionSecret: () => (process.env.SESSION_SECRET || '').trim()
};
