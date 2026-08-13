import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/constants/api";

const ACCESS_TOKEN_KEY = "amora_access_token";
const REFRESH_TOKEN_KEY = "amora_refresh_token";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Attach access token to requests.
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Handle expired access tokens.
 * Expects POST /auth/refresh with { refreshToken }
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      await clearTokens();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken }
      );

      const newAccessToken = response.data?.accessToken || response.data?.token;
      const newRefreshToken = response.data?.refreshToken;

      if (!newAccessToken) {
        throw new Error("No access token returned from refresh endpoint");
      }

      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
      if (newRefreshToken) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
      }

      processQueue(null, newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await clearTokens();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Token helpers                                                               */
/* -------------------------------------------------------------------------- */

export const saveTokens = async (accessToken: string, refreshToken?: string) => {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const getAccessToken = async () => {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = async () => {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
};

export const clearTokens = async () => {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
};

/* -------------------------------------------------------------------------- */
/* Authentication                                                              */
/* -------------------------------------------------------------------------- */

export const register = async (data: {
  email: string;
  username: string;
  password: string;
  displayName: string;
}) => {
  const response = await api.post("/auth/register", data);
  if (response.data?.accessToken) {
    await saveTokens(response.data.accessToken, response.data.refreshToken);
  }
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  if (response.data?.accessToken) {
    await saveTokens(response.data.accessToken, response.data.refreshToken);
  }
  return response.data;
};

export const logout = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    await api.post("/auth/logout", { refreshToken });
  } catch {
    // Ignore
  } finally {
    await clearTokens();
  }
};

export const getMe = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

/* -------------------------------------------------------------------------- */
/* Users / profiles                                                            */
/* -------------------------------------------------------------------------- */

export const getProfile = async (userId: string) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const updateProfile = async (data: {
  displayName?: string;
  username?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  goal?: "LIFE_PARTNER" | "MARRIAGE" | "LONG_TERM";
  avatar?: string;
}) => {
  const response = await api.patch("/users/me", data);
  return response.data;
};

export const getDiscoverUsers = async (params?: { page?: number; limit?: number }) => {
  const response = await api.get("/users/discover", { params });
  return response.data;
};

/* -------------------------------------------------------------------------- */
/* Preferences                                                                 */
/* -------------------------------------------------------------------------- */

export const getPreferences = async () => {
  const response = await api.get("/preferences");
  return response.data;
};

export const updatePreferences = async (data: {
  minAge?: number;
  maxAge?: number;
  preferredGender?: "MALE" | "FEMALE" | "OTHER";
  maxDistanceKm?: number;
  relationshipGoal?: "LIFE_PARTNER" | "MARRIAGE" | "LONG_TERM";
}) => {
  const response = await api.put("/preferences", data);
  return response.data;
};

/* -------------------------------------------------------------------------- */
/* Photos (URL-based)                                                         */
/* -------------------------------------------------------------------------- */

export const getMyPhotos = async () => {
  const response = await api.get("/photos");
  return response.data;
};

export const addPhoto = async (url: string) => {
  const response = await api.post("/photos", { url });
  return response.data;
};

export const deletePhoto = async (photoId: string) => {
  const response = await api.delete(`/photos/${photoId}`);
  return response.data;
};

export const setPrimaryPhoto = async (photoId: string) => {
  const response = await api.patch(`/photos/${photoId}/primary`);
  return response.data;
};

/* -------------------------------------------------------------------------- */
/* Photo Upload (multipart/form-data) – NEW                                   */
/* -------------------------------------------------------------------------- */

export const uploadPhoto = async (file: { uri: string; name: string; type: string }) => {
  const formData = new FormData();
  formData.append('photo', file as any);
  const response = await api.post('/photos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/* -------------------------------------------------------------------------- */
/* Likes                                                                       */
/* -------------------------------------------------------------------------- */

export const likeUser = async (userId: string) => {
  const response = await api.post("/likes", { receiverId: userId });
  return response.data;
};

export const unlikeUser = async (userId: string) => {
  const response = await api.delete(`/likes/${userId}`);
  return response.data;
};

export const getReceivedLikes = async () => {
  const response = await api.get("/likes/received");
  return response.data;
};

export const getSentLikes = async () => {
  const response = await api.get("/likes/sent");
  return response.data;
};

/* -------------------------------------------------------------------------- */
/* Matches                                                                     */
/* -------------------------------------------------------------------------- */

export const getMatches = async () => {
  const response = await api.get("/matches");
  return response.data;
};

export const getMatch = async (matchId: string) => {
  const response = await api.get(`/matches/${matchId}`);
  return response.data;
};

export const unmatch = async (matchId: string) => {
  const response = await api.patch(`/matches/${matchId}/unmatch`);
  return response.data;
};

/* -------------------------------------------------------------------------- */
/* Messages                                                                    */
/* -------------------------------------------------------------------------- */

export const getMessages = async (matchId: string, params?: { page?: number; limit?: number }) => {
  const response = await api.get(`/matches/${matchId}/messages`, { params });
  return response.data;
};

export const sendMessage = async (matchId: string, content: string, type: "TEXT" | "IMAGE" | "SYSTEM" = "TEXT") => {
  const response = await api.post(`/matches/${matchId}/messages`, { content, type });
  return response.data;
};

export const markMessageRead = async (messageId: string) => {
  const response = await api.patch(`/messages/${messageId}/read`);
  return response.data;
};

/* -------------------------------------------------------------------------- */
/* Notifications                                                               */
/* -------------------------------------------------------------------------- */

export const getNotifications = async () => {
  const response = await api.get("/notifications");
  return response.data;
};

export const markNotificationRead = async (notificationId: string) => {
  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.patch("/notifications/read-all");
  return response.data;
};

/* -------------------------------------------------------------------------- */
/* Blocks                                                                      */
/* -------------------------------------------------------------------------- */

export const blockUser = async (userId: string) => {
  const response = await api.post("/blocks", { blockedId: userId });
  return response.data;
};

export const unblockUser = async (userId: string) => {
  const response = await api.delete(`/blocks/${userId}`);
  return response.data;
};

export const getBlockedUsers = async () => {
  const response = await api.get("/blocks");
  return response.data;
};

/* -------------------------------------------------------------------------- */
/* Reports                                                                     */
/* -------------------------------------------------------------------------- */

export const reportUser = async (userId: string, reason: string, details?: string) => {
  const response = await api.post("/reports", { reportedId: userId, reason, details });
  return response.data;
};

/* -------------------------------------------------------------------------- */
/* Subscriptions                                                               */
/* -------------------------------------------------------------------------- */

export const getSubscription = async () => {
  const response = await api.get("/subscriptions/me");
  return response.data;
};

export const getSubscriptions = async () => {
  const response = await api.get("/subscriptions");
  return response.data;
};

/* -------------------------------------------------------------------------- */
/* Health                                                                      */
/* -------------------------------------------------------------------------- */

export const healthCheck = async () => {
  const response = await api.get("/health");
  return response.data;
};

export default api;
