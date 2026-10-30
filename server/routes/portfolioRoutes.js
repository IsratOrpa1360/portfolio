/**
 * server/routes/portfolioRoutes.js
 * Handles reading/writing portfolio data (`GET /api/portfolio`, `PUT /api/portfolio`)
 * and validated asset uploads (`POST /api/upload`).
 * All write endpoints require both a valid authenticated session and CSRF token.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');
const { getSessionFromRequest } = require('../middleware/authMiddleware');
const { verifyCsrfToken } = require('../middleware/csrfMiddleware');

const ROOT_DIR = path.resolve(__dirname, '../..');
const DATA_JS_PATH = path.join(ROOT_DIR, 'js/data.js');
const BACKUP_DIR = path.join(ROOT_DIR, 'server/backups');

function readCurrentPortfolioData() {
  const code = fs.readFileSync(DATA_JS_PATH, 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code + '\n;window.__exported = typeof portfolioData !== "undefined" ? portfolioData : window.portfolioData;', sandbox, { timeout: 1000 });
  return sandbox.window.__exported;
}

function sanitizeString(val, maxLen = 2000) {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

function isSafeRelativeAssetPath(p) {
  if (typeof p !== 'string') return false;
  const trimmed = p.trim();
  if (!trimmed) return true;
  if (trimmed.includes('..') || trimmed.startsWith('/') || trimmed.includes('\\')) return false;
  return /^(assets\/images\/[a-zA-Z0-9._/-]+|resume\.pdf|[a-zA-Z0-9._-]+-\d+\.pdf)$/.test(trimmed);
}

function validateAndNormalizePortfolioPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Portfolio payload must be a JSON object.');
  }
  if (!payload.personal || typeof payload.personal !== 'object') {
    throw new Error('Missing personal information section.');
  }
  if (!Array.isArray(payload.navigation) || !Array.isArray(payload.education) || !Array.isArray(payload.projects)) {
    throw new Error('Required collection arrays (navigation, education, projects) are missing.');
  }
  // Never allow secret keys inside public data.js
  const forbiddenKeys = ['password', 'ADMIN_PASSWORD', 'ADMIN_PASSWORD_HASH', 'SESSION_SECRET', 'secret'];
  const serialized = JSON.stringify(payload);
  for (const fk of forbiddenKeys) {
    if (serialized.includes(`"${fk}"`)) {
      throw new Error(`Forbidden credential field "${fk}" cannot be stored in public data.js.`);
    }
  }
  if (payload.personal.profileImage && !isSafeRelativeAssetPath(payload.personal.profileImage)) {
    throw new Error('Invalid profile image path.');
  }
  if (payload.resume && payload.resume.file && !isSafeRelativeAssetPath(payload.resume.file)) {
    throw new Error('Invalid resume file path.');
  }
  return payload;
}

function writePortfolioDataToJs(normalizedData) {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  if (fs.existsSync(DATA_JS_PATH)) {
    const backupFile = path.join(BACKUP_DIR, `data.js.${Date.now()}.bak`);
    fs.copyFileSync(DATA_JS_PATH, backupFile);
  }

  const headerComment = [
    '/**',
    ' * js/data.js — Centralized Public Portfolio Data (Model)',
    ' * IMPORTANT: This file is served publicly to every visitor.',
    ' * NEVER store passwords, hashes, session secrets, or private keys here.',
    ' */',
    '',
    'const portfolioData = '
  ].join('\n');

  const footerCode = [
    ';',
    '',
    'if (typeof window !== "undefined") {',
    '  window.portfolioData = portfolioData;',
    '}',
    'if (typeof module !== "undefined" && module.exports) {',
    '  module.exports = portfolioData;',
    '}',
    ''
  ].join('\n');

  const tmpPath = `${DATA_JS_PATH}.tmp`;
  fs.writeFileSync(tmpPath, headerComment + JSON.stringify(normalizedData, null, 2) + footerCode, 'utf8');
  fs.renameSync(tmpPath, DATA_JS_PATH);
}

const ALLOWED_UPLOAD_CATEGORIES = {
  profile: { dir: 'assets/images', allowedExt: ['.jpg', '.jpeg', '.png', '.webp', '.svg'] },
  projects: { dir: 'assets/images/projects', allowedExt: ['.jpg', '.jpeg', '.png', '.webp', '.svg'] },
  certificates: { dir: 'assets/images/certificates', allowedExt: ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.pdf'] },
  resume: { dir: '', allowedExt: ['.pdf'] }
};

async function handlePortfolioRoutes(req, res, pathname, parseJsonBody, sendJson) {
  if (pathname === '/api/portfolio' && req.method === 'GET') {
    try {
      const data = readCurrentPortfolioData();
      return sendJson(res, 200, { portfolioData: data });
    } catch (e) {
      return sendJson(res, 500, { error: 'Failed to read portfolio data.' });
    }
  }

  if (pathname === '/api/portfolio' && req.method === 'PUT') {
    const session = getSessionFromRequest(req);
    if (!session) {
      return sendJson(res, 401, { error: 'Authentication required.' });
    }
    if (!verifyCsrfToken(req, session)) {
      return sendJson(res, 403, { error: 'CSRF validation failed.' });
    }

    let body;
    try {
      body = await parseJsonBody(req);
    } catch (e) {
      return sendJson(res, 400, { error: 'Invalid JSON request body.' });
    }

    try {
      const normalized = validateAndNormalizePortfolioPayload(body.portfolioData || body);
      writePortfolioDataToJs(normalized);
      return sendJson(res, 200, {
        saved: true,
        message: 'Saved changes directly to js/data.js (with backup in server/backups/).',
        portfolioData: normalized
      });
    } catch (err) {
      return sendJson(res, 400, { error: sanitizeString(err.message, 240) });
    }
  }

  if (pathname === '/api/upload' && req.method === 'POST') {
    const session = getSessionFromRequest(req);
    if (!session) {
      return sendJson(res, 401, { error: 'Authentication required.' });
    }
    if (!verifyCsrfToken(req, session)) {
      return sendJson(res, 403, { error: 'CSRF validation failed.' });
    }

    let body;
    try {
      body = await parseJsonBody(req, 6 * 1024 * 1024); // Max 6MB payload
    } catch (e) {
      return sendJson(res, 400, { error: 'Invalid upload payload or file exceeds 5MB limit.' });
    }

    const category = sanitizeString(body.category, 32);
    const originalName = sanitizeString(body.filename, 120);
    const base64Content = typeof body.contentBase64 === 'string' ? body.contentBase64 : '';

    const catRule = ALLOWED_UPLOAD_CATEGORIES[category];
    if (!catRule) {
      return sendJson(res, 400, { error: 'Invalid upload category.' });
    }

    const ext = path.extname(originalName).toLowerCase();
    if (!catRule.allowedExt.includes(ext)) {
      return sendJson(res, 400, { error: `File extension ${ext || '(none)'} is not permitted for ${category}.` });
    }

    const buffer = Buffer.from(base64Content, 'base64');
    if (buffer.length === 0 || buffer.length > 5 * 1024 * 1024) {
      return sendJson(res, 400, { error: 'Uploaded file must be between 1 byte and 5 MB.' });
    }

    const safeStem = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 40) || 'asset';
    const finalFilename = category === 'profile'
      ? `profile${ext}`
      : category === 'resume'
        ? 'resume.pdf'
        : `${safeStem}-${crypto.randomBytes(4).toString('hex')}${ext}`;

    const relPath = catRule.dir ? `${catRule.dir}/${finalFilename}` : finalFilename;
    const absTarget = path.resolve(ROOT_DIR, relPath);
    if (!absTarget.startsWith(ROOT_DIR)) {
      return sendJson(res, 400, { error: 'Invalid file destination.' });
    }

    fs.mkdirSync(path.dirname(absTarget), { recursive: true });
    fs.writeFileSync(absTarget, buffer);

    return sendJson(res, 200, {
      uploaded: true,
      path: relPath
    });
  }

  return false;
}

module.exports = { handlePortfolioRoutes };
