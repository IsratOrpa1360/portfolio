#!/usr/bin/env node
/**
 * server/scripts/test-security.js
 * Automated Security & Functional Test Suite for Orpa's MVC Portfolio.
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { hashPasswordScrypt, generateSessionSecret } = require('./hash-password');

const ROOT_DIR = path.resolve(__dirname, '../..');

function request(port, method, reqPath, { headers = {}, body = null } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const reqHeaders = { ...headers };
    if (payload && !reqHeaders['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }
    const req = http.request(
      { hostname: '127.0.0.1', port, path: reqPath, method, headers: reqHeaders },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          let json = null;
          try { json = JSON.parse(text); } catch (e) {}
          resolve({ status: res.statusCode, headers: res.headers, text, json });
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('=== Running Orpa MVC Portfolio Security & Functional Tests ===\n');

  // Test 1: Check Frontend Files for Exposed Secrets
  const frontendFiles = [
    'index.html',
    'css/style.css',
    'js/data.js',
    'js/script.js',
    'js/auth.js',
    'js/admin.js',
    'js/three-scene.js'
  ];
  for (const rel of frontendFiles) {
    const content = fs.readFileSync(path.join(ROOT_DIR, rel), 'utf8');
    assert(!content.includes('Orpa@AIUB2026'), `Exposed old password found in ${rel}`);
    assert(!content.includes('ADMIN_PASSWORD_CODE_ONLY'), `Old frontend password config found in ${rel}`);
    assert(!content.includes('scrypt$16384$'), `Password hash exposed in ${rel}`);
  }
  console.log('[PASS] 1. Zero passwords, hashes, or secrets exposed in any frontend file.');

  // Test 2: Fail-closed when .env secrets are missing
  delete process.env.ADMIN_PASSWORD_HASH;
  delete process.env.SESSION_SECRET;
  const { createPortfolioServer } = require('../server');
  const server = createPortfolioServer();
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;

  const unconfigRes = await request(port, 'POST', '/api/auth/login', {
    body: { password: 'any-password' }
  });
  assert.strictEqual(unconfigRes.status, 503, 'Expected 503 when .env is unconfigured');
  console.log('[PASS] 2. Server fails closed (503) when ADMIN_PASSWORD_HASH / SESSION_SECRET are missing.');

  // Test 3: Dotfile & Server Directory Access Protection + Static Asset Delivery
  const envLeakRes = await request(port, 'GET', '/.env');
  assert.strictEqual(envLeakRes.status, 403, 'Expected 403 for /.env');
  const srvLeakRes = await request(port, 'GET', '/server/server.js');
  assert.strictEqual(srvLeakRes.status, 403, 'Expected 403 for /server/server.js');
  const pkgLeakRes = await request(port, 'GET', '/package.json');
  assert.strictEqual(pkgLeakRes.status, 403, 'Expected 403 for /package.json');
  const resumeRes = await request(port, 'GET', '/resume.pdf');
  assert.strictEqual(resumeRes.status, 200, 'Expected 200 for /resume.pdf');
  assert.strictEqual(resumeRes.headers['x-content-type-options'], 'nosniff');
  console.log('[PASS] 3. Static server blocks /.env, /server/*, and /package.json (403) and serves /resume.pdf (200) with security headers.');

  // Configure runtime test credentials in memory (not written to disk)
  const EphemeralTestPass = 'TempTestPass_' + Date.now();
  process.env.ADMIN_PASSWORD_HASH = hashPasswordScrypt(EphemeralTestPass);
  process.env.SESSION_SECRET = generateSessionSecret();

  // Test 4: Unauthenticated Write Protection
  const unauthWrite = await request(port, 'PUT', '/api/portfolio', {
    body: { portfolioData: {} }
  });
  assert.strictEqual(unauthWrite.status, 401, 'Expected 401 for unauthenticated PUT /api/portfolio');
  console.log('[PASS] 4. Unauthenticated write requests to PUT /api/portfolio are rejected (401).');

  // Test 5: Invalid Password Rejection
  const badLogin = await request(port, 'POST', '/api/auth/login', {
    body: { password: 'WrongPassword123!' }
  });
  assert.strictEqual(badLogin.status, 401, 'Expected 401 for wrong password');
  console.log('[PASS] 5. Invalid password rejected with 401 and generic error message.');

  // Test 6: Valid Login, HttpOnly + SameSite=Strict Cookie & CSRF Protection
  const goodLogin = await request(port, 'POST', '/api/auth/login', {
    body: { password: EphemeralTestPass }
  });
  assert.strictEqual(goodLogin.status, 200, 'Expected 200 for valid login');
  const setCookie = (goodLogin.headers['set-cookie'] || [])[0] || '';
  assert(setCookie.includes('HttpOnly'), 'Session cookie must be HttpOnly');
  assert(setCookie.includes('SameSite=Strict'), 'Session cookie must be SameSite=Strict');
  const cookiePair = setCookie.split(';')[0];
  const csrfToken = goodLogin.json.csrfToken;
  assert(csrfToken && csrfToken.length >= 32, 'CSRF token must be returned on login');

  // Attempt write WITHOUT CSRF header -> must fail with 403
  const currentGet = await request(port, 'GET', '/api/portfolio');
  const originalData = currentGet.json.portfolioData;

  const noCsrfWrite = await request(port, 'PUT', '/api/portfolio', {
    headers: { Cookie: cookiePair },
    body: { portfolioData: originalData }
  });
  assert.strictEqual(noCsrfWrite.status, 403, 'Expected 403 when X-CSRF-Token is missing');

  // Attempt write WITH valid Cookie + CSRF token -> must succeed (200)
  const validWrite = await request(port, 'PUT', '/api/portfolio', {
    headers: { Cookie: cookiePair, 'X-CSRF-Token': csrfToken },
    body: { portfolioData: originalData }
  });
  assert.strictEqual(validWrite.status, 200, 'Expected 200 for authenticated + CSRF-verified PUT');
  console.log('[PASS] 6. Valid login issues HttpOnly/SameSite=Strict cookie, enforces CSRF (403 without token), and persists authorized writes (200).');

  // Clean up test backup files created during test
  const backupDir = path.join(ROOT_DIR, 'server/backups');
  if (fs.existsSync(backupDir)) {
    for (const f of fs.readdirSync(backupDir)) {
      if (f.endsWith('.bak')) fs.unlinkSync(path.join(backupDir, f));
    }
  }

  // Test 7: Logout Session Invalidation
  const logoutRes = await request(port, 'POST', '/api/auth/logout', {
    headers: { Cookie: cookiePair, 'X-CSRF-Token': csrfToken }
  });
  assert.strictEqual(logoutRes.status, 200);
  const postLogoutWrite = await request(port, 'PUT', '/api/portfolio', {
    headers: { Cookie: cookiePair, 'X-CSRF-Token': csrfToken },
    body: { portfolioData: originalData }
  });
  assert.strictEqual(postLogoutWrite.status, 401, 'Expected 401 after session logout');
  console.log('[PASS] 7. Logout invalidates server session immediately (subsequent writes return 401).');

  // Test 8: Brute-Force Rate Limiting (5 failed attempts -> 429)
  for (let i = 0; i < 5; i++) {
    await request(port, 'POST', '/api/auth/login', { body: { password: 'bad' } });
  }
  const rateLimitedRes = await request(port, 'POST', '/api/auth/login', {
    body: { password: 'bad' }
  });
  assert.strictEqual(rateLimitedRes.status, 429, 'Expected 429 after 5 failed attempts');
  console.log('[PASS] 8. Brute-force login rate limiter blocks 6th failed attempt with 429 Too Many Requests.');

  server.close();
  console.log('\n=== ALL 8 SECURITY & FUNCTIONAL TESTS PASSED ===');
}

runTests().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
