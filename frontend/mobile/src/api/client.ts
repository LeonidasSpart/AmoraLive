import { getItem, setItem, deleteItem } from "../storage";
import Constants from 'expo-constants';

export const API_URL: string =
  (Constants.expoConfig?.extra as any)?.apiUrl || 'https://api.amoramatch.one';

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';
const USER_KEY = 'userId';

async function getAccessToken() {
  return getItem(ACCESS_KEY);
}

async function getRefreshToken() {
  return getItem(REFRESH_KEY);
}

function tokenExpiresWithin(token: string, skewMs = 30_000) {
  try {
    const payload = token.split(".")[1];
    if (!payload || typeof globalThis.atob !== "function") return true;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const binary = globalThis.atob(padded);
    const json = decodeURIComponent(
      Array.from(binary)
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );
    const exp = Number(JSON.parse(json)?.exp);
    return !Number.isFinite(exp) || exp * 1000 <= Date.now() + skewMs;
  } catch {
    return true;
  }
}

let refreshPromise: Promise<boolean> | null = null;

export async function getUserId() {
  return getItem(USER_KEY);
}

export async function getValidAccessToken() {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;
  if (!tokenExpiresWithin(accessToken)) return accessToken;

  const refreshed = await tryRefresh();
  return refreshed ? getAccessToken() : null;
}

export async function isLoggedIn() {
  return Boolean(await getValidAccessToken());
}

export async function storeSession(session: {
  accessToken: string;
  refreshToken?: string;
  user?: { id?: string };
}) {
  if (session.accessToken) await setItem(ACCESS_KEY, session.accessToken);
  if (session.refreshToken) await setItem(REFRESH_KEY, session.refreshToken);
  if (session.user?.id) await setItem(USER_KEY, session.user.id);
}

export async function clearSession() {
  await Promise.all([
    deleteItem(ACCESS_KEY),
    deleteItem(REFRESH_KEY),
    deleteItem(USER_KEY)
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
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
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
      await setItem(ACCESS_KEY, data.accessToken);
      if (data.refreshToken) await setItem(REFRESH_KEY, data.refreshToken);
      if (data.user?.id) await setItem(USER_KEY, String(data.user.id));
      return true;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

async function uploadFile(path: string, formData: FormData, retry = true): Promise<any> {
  const accessToken = await getAccessToken();
  // Deliberately no Content-Type header here — fetch sets the correct
  // multipart/form-data boundary automatically. Setting it manually (as the
  // shared request() helper does for JSON) breaks multipart uploads.
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    },
    body: formData
  });
  if (response.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) return uploadFile(path, formData, false);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(data.error || `API ${response.status}`, response.status);
  return data;
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
  appleNative: (body: unknown) => request('/auth/apple/native', { method: 'POST', body: JSON.stringify(body) }),
  socialExchange: async (code: string) => {
    const result = await request('/auth/social/exchange', { method: 'POST', body: JSON.stringify({ code }) });
    if (result.accessToken) await storeSession(result);
    return result;
  },
  socialComplete: async (body: unknown) => {
    const session = await request('/auth/social/complete', { method: 'POST', body: JSON.stringify(body) });
    await storeSession(session);
    return session;
  },
  resendVerification: (email: string) =>
    request('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),
  logout: async () => {
    const refreshToken = await getRefreshToken();
    await request('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }).catch(() => {});
    await clearSession();
  },
  me: () => request('/users/me'),
  user: (userId: string) => request(`/users/${userId}`),
  updateProfile: (body: unknown) => request('/users/me', { method: 'PATCH', body: JSON.stringify(body) }),
  deleteAccount: () => request('/users/me', { method: 'DELETE' }),
  uploadPhoto: (formData: FormData) => uploadFile('/users/me/photos', formData),
  nextMatch: () => request('/matches/next'),
  acceptMatch: (targetUserId: string) => request('/matches/accept', { method: 'POST', body: JSON.stringify({ targetUserId }) }),
  skipMatch: (targetUserId: string) => request('/matches/skip', { method: 'POST', body: JSON.stringify({ targetUserId }) }),
  swipe: (targetUserId: string, decision: 'like' | 'pass' | 'superlike') =>
    request('/matches/swipe', { method: 'POST', body: JSON.stringify({ targetUserId, decision }) }),
  matchList: () => request('/matches'),
  unmatch: (matchId: string) => request(`/matches/${matchId}/unmatch`, { method: 'POST' }),
  conversations: () => request('/messages/conversations'),
  messages: (userId: string, limit = 50) => request(`/messages/${userId}?limit=${limit}`),
  sendMessage: (userId: string, content: string) => request(`/messages/${userId}`, { method: 'POST', body: JSON.stringify({ content }) }),
  uploadMessageMedia: (formData: FormData) => uploadFile('/messages/upload', formData),
  wallet: () => request('/wallet/me'),
  walletTransactions: () => request('/wallet/transactions'),
  gifts: () => request('/gifts/catalog'),
  sendGift: (body: unknown) => request('/gifts/send', { method: 'POST', body: JSON.stringify(body) }),
  topGifters: (roomId: string) => request(`/live/${roomId}/top-gifters`),
  followUser: (userId: string) => request(`/users/${userId}/follow`, { method: 'POST' }),
  unfollowUser: (userId: string) => request(`/users/${userId}/unfollow`, { method: 'POST' }),
  followStatus: (userId: string) => request(`/users/${userId}/follow-status`),
  battleStatus: (roomId: string) => request(`/live/${roomId}/battle`),
  battleInvite: (roomId: string, targetRoomId: string) =>
    request(`/live/${roomId}/battle/invite`, { method: 'POST', body: JSON.stringify({ targetRoomId }) }),
  battleAccept: (roomId: string) => request(`/live/${roomId}/battle/accept`, { method: 'POST' }),
  battleDecline: (roomId: string) => request(`/live/${roomId}/battle/decline`, { method: 'POST' }),
  battleEnd: (roomId: string) => request(`/live/${roomId}/battle/end`, { method: 'POST' }),
  liveRooms: () => request('/live'),
  liveRoom: (roomId: string) => request(`/live/${roomId}`),
  createLiveRoom: (body: { title: string; category: string; thumbnail_url?: string }) =>
    request('/live', { method: 'POST', body: JSON.stringify(body) }),
  liveToken: (roomId: string) => request(`/live/${roomId}/token`),
  joinLiveRoom: (roomId: string) => request(`/live/${roomId}/join`, { method: 'POST' }),
  leaveLiveRoom: (roomId: string) => request(`/live/${roomId}/leave`, { method: 'POST' }),
  endLiveRoom: (roomId: string) => request(`/live/${roomId}/end`, { method: 'POST' }),
  activeEvent: () => request('/events/active'),
  joinEventTeam: (eventId: string, team: string) =>
    request('/events/join', { method: 'POST', body: JSON.stringify({ eventId, team }) }),
  eventLeaderboard: (eventId: string) => request(`/events/leaderboard/${eventId}`),
  coinPackages: (platform: string) => request(`/wallet/packages?platform=${platform}`),
  checkout: (packageId: string) => request('/wallet/checkout', { method: 'POST', body: JSON.stringify({ packageId }) }),
  verifyApplePurchase: (packageId: string, receiptData: string) =>
    request('/wallet/iap/apple/verify', { method: 'POST', body: JSON.stringify({ packageId, receiptData }) }),
  verifyGooglePurchase: (packageId: string, purchaseToken: string) =>
    request('/wallet/iap/google/verify', { method: 'POST', body: JSON.stringify({ packageId, purchaseToken }) }),
  membership: () => request('/membership/me'),
  membershipPlans: () => request('/membership/plans'),
  membershipCheckout: (tier: string) => request('/membership/checkout', { method: 'POST', body: JSON.stringify({ tier }) }),
  verifyAppleSubscription: (receiptData: string) =>
    request('/membership/iap/apple/verify', { method: 'POST', body: JSON.stringify({ receiptData }) }),
  verifyGoogleSubscription: (tier: string, purchaseToken: string) =>
    request('/membership/iap/google/verify', { method: 'POST', body: JSON.stringify({ tier, purchaseToken }) }),
  membershipCancel: () => request('/membership/cancel', { method: 'POST' }),
  dailyRewardStatus: () => request('/daily-rewards/status'),
  dailyRewardHistory: () => request('/daily-rewards/history?limit=14'),
  claimDailyReward: () => request('/daily-rewards/claim', { method: 'POST' }),
  storeCatalog: () => request('/store/catalog'),
  storeMy: () => request('/store/my'),
  storePurchase: (cosmeticId: string) => request('/store/purchase', { method: 'POST', body: JSON.stringify({ cosmeticId }) }),
  equipCosmetic: (cosmeticId: string) => request('/store/equip', { method: 'POST', body: JSON.stringify({ cosmeticId }) }),
  unequipCosmetic: (cosmeticId: string) => request('/store/unequip', { method: 'POST', body: JSON.stringify({ cosmeticId }) }),
  securityOverview: () => request('/safety/security/overview'),
  securityEvents: () => request('/safety/security/events'),
  sessions: () => request('/safety/sessions'),
  revokeSession: (sessionId: string) => request(`/safety/sessions/${sessionId}`, { method: 'DELETE' }),
  revokeOtherSessions: async () => {
    const refreshToken = await getRefreshToken();
    return request('/safety/sessions/revoke-others', { method: 'POST', body: JSON.stringify({ currentRefreshToken: refreshToken }) });
  },
  privacy: () => request('/users/me/privacy'),
  updatePrivacy: (body: unknown) => request('/users/me/privacy', { method: 'PATCH', body: JSON.stringify(body) })
};

export { ApiError };
