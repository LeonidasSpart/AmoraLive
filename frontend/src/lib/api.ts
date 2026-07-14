import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Versioned base path — backend enables URI versioning with defaultVersion '1'
export const api = axios.create({
  baseURL: `${API_URL}/v1`,
  headers: { 'Content-Type': 'application/json' },
});

// --- Token storage -------------------------------------------------------
// Kept in one place so the auth store and this client agree on the source of truth.
export const tokenStorage = {
  getAccess: () => (typeof window === 'undefined' ? null : localStorage.getItem('amora_access_token')),
  getRefresh: () => (typeof window === 'undefined' ? null : localStorage.getItem('amora_refresh_token')),
  set: (accessToken: string, refreshToken: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('amora_access_token', accessToken);
    localStorage.setItem('amora_refresh_token', refreshToken);
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('amora_access_token');
    localStorage.removeItem('amora_refresh_token');
  },
};

// --- Attach access token to every request ---------------------------------
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Auto-refresh on 401, retry original request once ---------------------
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post(`${API_URL}/v1/auth/refresh`, { refreshToken });
    tokenStorage.set(data.tokens.accessToken, data.tokens.refreshToken);
    return data.tokens.accessToken;
  } catch {
    tokenStorage.clear();
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      // Coalesce concurrent 401s into a single refresh call
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;
      if (newToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }

      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  },
);

// --- Typed endpoint groups --------------------------------------------------

export interface CompatibilityBreakdown {
  overallScore: number;
  personalityScore: number;
  interestScore: number;
  lifestyleScore: number;
  valuesScore: number;
  factors: Record<string, number>;
}

export interface DiscoverCandidate {
  id: string;
  profile: {
    id: string;
    firstName: string;
    displayName?: string;
    bio?: string;
    age: number | null;
    city?: string;
    country?: string;
    photos: string[];
    verified: boolean;
  };
  compatibility: CompatibilityBreakdown;
  distanceKm: number | null;
}

export const authApi = {
  register: (payload: any) => api.post('/auth/register', payload).then((r) => r.data),
  login: (payload: { email: string; password: string }) => api.post('/auth/login', payload).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }).then((r) => r.data),
};

export const matchingApi = {
  getRecommendations: (limit = 10) =>
    api.get<DiscoverCandidate[]>('/matching/recommendations', { params: { limit } }).then((r) => r.data),
  like: (targetId: string, type: 'LIKE' | 'SUPERLIKE' = 'LIKE', message?: string) =>
    api.post('/matching/like', { targetId, type, message }).then((r) => r.data),
  pass: (targetId: string) => api.post('/matching/pass', { targetId }).then((r) => r.data),
  getMatches: () => api.get('/matching/matches').then((r) => r.data),
  getLikes: () => api.get('/matching/likes').then((r) => r.data),
};

export const messagingApi = {
  getConversations: () => api.get('/messaging/conversations').then((r) => r.data),
  getMessages: (conversationId: string, page = 1, limit = 50) =>
    api
      .get(`/messaging/conversations/${conversationId}/messages`, { params: { page, limit } })
      .then((r) => r.data),
  createConversation: (matchId: string) =>
    api.post('/messaging/conversations', { matchId }).then((r) => r.data),
  sendMessage: (conversationId: string, content: string) =>
    api.post(`/messaging/conversations/${conversationId}/messages`, { content }).then((r) => r.data),
  markRead: (conversationId: string, lastReadMessageId: string) =>
    api.post(`/messaging/conversations/${conversationId}/read`, { lastReadMessageId }).then((r) => r.data),
};

export const paymentsApi = {
  createPayPalOrder: (amount: number, currency = 'USD') =>
    api.post('/payments/paypal/create', { amount, currency }).then((r) => r.data),
  createCryptoPayment: (amount: number, currency: string, cryptoType: string) =>
    api.post('/payments/crypto/create', { amount, currency, cryptoType }).then((r) => r.data),
};
