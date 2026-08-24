import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

export const API_URL: string =
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

async function uploadFile(path: string, formData: FormData): Promise<any> {
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
  updateProfile: (body: unknown) => request('/users/me', { method: 'PATCH', body: JSON.stringify(body) }),
  deleteAccount: () => request('/users/me', { method: 'DELETE' }),
  uploadPhoto: (formData: FormData) => uploadFile('/users/me/photos', formData),
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

export { API_URL, ApiError };
