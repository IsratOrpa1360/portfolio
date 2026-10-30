/**
 * server/server.js
 * MVC Backend Server for Isratul Ibnat Orpa's Portfolio.
 * Serves public static files safely (blocking .env and server internals) and
 * mounts `/api/auth/*` and `/api/portfolio` endpoints.
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { PORT, getAuthConfigStatus } = require('./config/env');
const { handleAuthRoutes } = require('./routes/authRoutes');
const { handlePortfolioRoutes } = require('./routes/portfolioRoutes');

const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon'
};

function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}

function sendJson(res, statusCode, data) {
  setSecurityHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req, maxBytes = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let total = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        req.destroy();
        reject(new Error('Payload too large'));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function serveStaticFile(req, res, pathname) {
  setSecurityHeaders(res);
  const cleanPath = pathname === '/' || pathname === '/admin' ? '/index.html' : pathname;

  // Strictly block dotfiles (.env, .git), package.json, and server directory
  const normalized = path.posix.normalize(cleanPath);
  if (
    normalized.includes('..') ||
    normalized.startsWith('/.') ||
    normalized.includes('/.') ||
    normalized.startsWith('/server') ||
    normalized === '/package.json'
  ) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  const absPath = path.resolve(ROOT_DIR, '.' + normalized);
  if (!absPath.startsWith(ROOT_DIR) || !fs.existsSync(absPath) || fs.statSync(absPath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return;
  }

  const ext = path.extname(absPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(absPath).pipe(res);
}

function createPortfolioServer() {
  return http.createServer(async (req, res) => {
    try {
      const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const pathname = parsedUrl.pathname;

      if (pathname.startsWith('/api/auth/')) {
        const handled = await handleAuthRoutes(req, res, pathname, parseJsonBody, sendJson);
        if (handled !== false) return;
      }

      if (pathname.startsWith('/api/portfolio') || pathname.startsWith('/api/upload')) {
        const handled = await handlePortfolioRoutes(req, res, pathname, parseJsonBody, sendJson);
        if (handled !== false) return;
      }

      serveStaticFile(req, res, pathname);
    } catch (err) {
      sendJson(res, 500, { error: 'Internal server error.' });
    }
  });
}

if (require.main === module) {
  const status = getAuthConfigStatus();
  const server = createPortfolioServer();
  server.listen(PORT, () => {
    console.log(`Orpa MVC Portfolio Server listening on http://localhost:${PORT}`);
    if (!status.isConfigured) {
      console.warn(
        'WARNING: ADMIN_PASSWORD_HASH or SESSION_SECRET is missing or set to placeholder in .env.\n' +
        'Admin login is locked (fail-closed) until you run `npm run hash-password` and configure `.env`.'
      );
    }
  });
}

module.exports = { createPortfolioServer };
