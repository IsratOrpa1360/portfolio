/**
 * js/auth.js — Client Authentication Controller
 * Communicates with the Node.js backend (`/api/auth/session`, `/api/auth/login`,
 * `/api/auth/logout`). Never stores passwords or hashes in frontend code or
 * browser storage.
 */

(function () {
  'use strict';

  const AuthState = {
    authenticated: false,
    csrfToken: null,
    serverReachable: false,
    serverConfigured: false,
    localPreviewOnly: false
  };

  async function checkSession() {
    try {
      const apiSessionUrl = ['/api', 'auth', 'session'].join('/');
      const res = await fetch(apiSessionUrl, {
        method: 'GET',
        credentials: 'same-origin',
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error('Session endpoint unavailable');
      const data = await res.json();
      AuthState.serverReachable = true;
      AuthState.serverConfigured = Boolean(data.serverConfigured);
      AuthState.authenticated = Boolean(data.authenticated);
      AuthState.csrfToken = data.csrfToken || null;
      AuthState.localPreviewOnly = false;
      return { ...AuthState };
    } catch (err) {
      AuthState.serverReachable = false;
      AuthState.serverConfigured = false;
      return { ...AuthState };
    }
  }

  async function loginWithPassword(password) {
    if (!password || typeof password !== 'string') {
      return { ok: false, error: 'Please enter your admin password.' };
    }
    try {
      const res = await fetch(['/api', 'auth', 'login'].join('/'), {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ password })
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Backend server is not running on this host.');
      }
      const data = await res.json();
      if (!res.ok) {
        return {
          ok: false,
          status: res.status,
          error: data.error || 'Authentication failed.'
        };
      }
      AuthState.authenticated = true;
      AuthState.csrfToken = data.csrfToken || null;
      AuthState.serverReachable = true;
      AuthState.localPreviewOnly = false;
      return { ok: true, mode: 'server' };
    } catch (networkErr) {
      return {
        ok: false,
        networkOffline: true,
        error: 'Backend server (/api/auth/login) is unreachable in static file preview. Run `npm start` locally for real server-side authentication, or use Local Draft Preview below to inspect the Admin Dashboard UI.'
      };
    }
  }

  function enableLocalDraftPreviewMode() {
    AuthState.authenticated = true;
    AuthState.localPreviewOnly = true;
    AuthState.csrfToken = null;
    return { ...AuthState };
  }

  async function logout() {
    if (AuthState.serverReachable && !AuthState.localPreviewOnly) {
      try {
        await fetch(['/api', 'auth', 'logout'].join('/'), {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'X-CSRF-Token': AuthState.csrfToken || '',
            'Accept': 'application/json'
          }
        });
      } catch (e) {}
    }
    AuthState.authenticated = false;
    AuthState.csrfToken = null;
    AuthState.localPreviewOnly = false;
  }

  window.OrpaAuth = {
    getState: () => ({ ...AuthState }),
    checkSession,
    loginWithPassword,
    enableLocalDraftPreviewMode,
    logout
  };
})();
