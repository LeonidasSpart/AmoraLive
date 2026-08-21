import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const API_URL: string =
  (Constants.expoConfig?.extra as any)?.apiUrl || 'https://api.amoramatch.one';

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';
const USER_KEY = 'userId';

async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_KEY);
}

async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_KEY);
}

export async function getUserId() {
  return SecureStore.getItemAsync(USER_KEY);
}

export async function isLoggedIn() {
  return Boolean(await getAccessToken());
}

export async function storeSession(session: {
  accessToken: string;
  refreshToken?: string;
  user?: { id?: string };
}) {
  if (session.accessToken) await SecureStore.setItemAsync(ACCESS_KEY, session.accessToken);
  if (session.refreshToken) await SecureStore.setItemAsync(REFRESH_KEY, session.refreshToken);
  if (session.user?.id) await SecureStore.setItemAsync(USER_KEY, session.user.id);
}

export async function clearSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
    SecureStore.deleteItemAsync(USER_KEY)
  ]);
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request(path: string, options: RequestInit = {}, retry = true): Promise<any> {
  const accessToken = await getAccessToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {})
    }
  });

  // Access tokens are short-lived. If one expired mid-session, use the
  // refresh token once to get a new one and replay the original request.
  if (response.status === 401 && retry && path !== '/auth/refresh') {
    const refreshed = await tryRefresh();
    if (refreshed) return request(path, options, false);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(data.error || `API ${response.status}`, response.status);
  return data;
}

async function tryRefresh() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.accessToken) {
      await clearSession();
      return false;
    }
    await SecureStore.setItemAsync(ACCESS_KEY, data.accessToken);
    return true;
  } catch {
    return false;
  }
}

export const api = {
  register: (body: unknown) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: async (body: unknown) => {
    const session = await request('/auth/login', { method: 'POST', body: JSON.stringify(body) });
    await storeSession(session);
    return session;
  },
  googleComplete: async (body: unknown) => {
    const session = await request('/auth/google/complete', { method: 'POST', body: JSON.stringify(body) });
    await storeSession(session);
    return session;
  },
  resendVerification: (email: string) =>
    request('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) }),
  logout: async () => {
    const refreshToken = await getRefreshToken();
    await request('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }).catch(() => {});
    await clearSession();
  },
  me: () => request('/users/me'),
  nextMatch: () => request('/matches/next'),
  acceptMatch: (targetUserId: string) => request('/matches/accept', { method: 'POST', body: JSON.stringify({ targetUserId }) }),
  skipMatch: (targetUserId: string) => request('/matches/skip', { method: 'POST', body: JSON.stringify({ targetUserId }) }),
  conversations: () => request('/messages/conversations'),
  messages: (userId: string) => request(`/messages/${userId}`),
  sendMessage: (userId: string, content: string) => request(`/messages/${userId}`, { method: 'POST', body: JSON.stringify({ content }) }),
  wallet: () => request('/wallet/me'),
  walletTransactions: () => request('/wallet/transactions'),
  gifts: () => request('/gifts/catalog'),
  sendGift: (body: unknown) => request('/gifts/send', { method: 'POST', body: JSON.stringify(body) }),
  liveRooms: () => request('/live'),
  liveRoom: (roomId: string) => request(`/live/${roomId}`),
  membership: () => request('/membership/me')
};

export { API_URL, ApiError };
