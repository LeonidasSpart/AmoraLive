// frontend/web/lib/api.js
//
// Every page previously called fetch() directly with a raw Authorization
// header and no recovery path: once the 15-minute access token expired,
// every single request failed with 401 until the person manually logged
// out and back in, even though a refreshToken was already being stored on
// every login and just never used. This wraps fetch with that missing
// refresh-and-retry step.
//
// Written as CommonJS (module.exports, no `export` keyword) because this
// package.json declares "type": "commonjs" — under that setting webpack
// parses plain .js files as CommonJS, and `export` syntax fails to parse.
// Every page still imports this normally via `import { apiFetch } from
// '../lib/api'` — that works fine against a CommonJS module through
// webpack's standard ESM/CJS interop, so nothing else needed to change.

const API = (process.env.NEXT_PUBLIC_API_URL || 'https://api.amoramatch.one').replace(/\/+$/, '');

let refreshInFlight = null;

function getAccessToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
}

function getRefreshToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
}

function storeAccessToken(token) {
  if (typeof window !== 'undefined') localStorage.setItem('accessToken', token);
}

function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  // Multiple simultaneous 401s (e.g. a page firing several requests at
  // once) should trigger exactly one refresh call, not one per request.
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        if (data.accessToken) storeAccessToken(data.accessToken);
        if (data.refreshToken && typeof window !== 'undefined') localStorage.setItem('refreshToken', data.refreshToken);
        if (data.user?.id && typeof window !== 'undefined') localStorage.setItem('userId', String(data.user.id));
        return data.accessToken || null;
      })
      .catch(() => null)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

/**
 * Drop-in replacement for fetch() against the Amora API. Automatically
 * attaches the current access token, and on a 401 tries exactly one
 * refresh-and-retry before giving up and redirecting to /login.
 *
 * @param {string} path - either a full URL or a path like '/wallet/me'
 * @param {RequestInit} options
 * @param {{ skipAuth?: boolean, skipRefresh?: boolean }} extra
 */
async function apiFetch(path, options = {}, extra = {}) {
  const url = path.startsWith('http') ? path : `${API}${path}`;
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const buildHeaders = () => {
    const headers = { ...(options.headers || {}) };
    if (!isFormData && options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    if (!extra.skipAuth) {
      const token = getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  };

  let res = await fetch(url, { ...options, headers: buildHeaders() });

  if (res.status === 401 && !extra.skipAuth && !extra.skipRefresh) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await fetch(url, { ...options, headers: buildHeaders() });
    } else {
      clearSession();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
  }

  return res;
}

/** Convenience helper: apiFetch + parsed JSON + thrown Error on failure. */
async function apiJson(path, options = {}, extra = {}) {
  const res = await apiFetch(path, options, extra);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

module.exports = { API, apiFetch, apiJson, getAccessToken, getRefreshToken, clearSession };
