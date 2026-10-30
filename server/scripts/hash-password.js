#!/usr/bin/env node
/**
 * server/scripts/hash-password.js
 * Generates a salted cryptographic password hash (scrypt, memory-hard) and a
 * random SESSION_SECRET for your local `.env` or production environment settings.
 *
 * Usage:
 *   npm run hash-password
 */

'use strict';

const crypto = require('crypto');
const readline = require('readline');

function hashPasswordScrypt(plainPassword) {
  const N = 16384;
  const r = 8;
  const p = 1;
  const keylen = 64;
  const salt = crypto.randomBytes(16);
  const derivedKey = crypto.scryptSync(plainPassword, salt, keylen, { N, r, p });
  return `scrypt$${N}$${r}$${p}$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
}

function generateSessionSecret() {
  return crypto.randomBytes(48).toString('hex');
}

if (require.main === module) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter new admin password to hash (input will be hashed locally): ', (password) => {
    rl.close();
    const trimmed = String(password || '').trim();
    if (trimmed.length < 8) {
      console.error('Error: Password must be at least 8 characters long.');
      process.exit(1);
    }
    const hash = hashPasswordScrypt(trimmed);
    const sessionSecret = generateSessionSecret();
    console.log('\n============================================================');
    console.log('Copy these lines into your private `.env` file (or hosting dashboard):');
    console.log('============================================================\n');
    console.log(`ADMIN_PASSWORD_HASH=${hash}`);
    console.log(`SESSION_SECRET=${sessionSecret}\n`);
    console.log('IMPORTANT: Never commit `.env` to Git or share these values publicly.');
  });
}

module.exports = { hashPasswordScrypt, generateSessionSecret };
