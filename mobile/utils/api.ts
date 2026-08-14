const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-railway-url.up.railway.app';

export const api = {
  get: (endpoint: string, token?: string) =>
    fetch(`${API_URL}${endpoint}`, { headers: authHeaders(token) }),
  post: (endpoint: string, body: any, token?: string) =>
    fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  patch: (endpoint: string, body: any, token?: string) =>
    fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
};

const authHeaders = (token?: string) =>
  token ? { Authorization: `Bearer ${token}` } : {};
