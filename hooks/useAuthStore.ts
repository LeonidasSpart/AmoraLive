import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://api.amoramatch.one';

const ACCESS_TOKEN_KEY = 'amora_access_token';
const REFRESH_TOKEN_KEY = 'amora_refresh_token';

export interface User {
  id: string;
  email?: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  level: number;
  vip: boolean;
  coins: number;
  followers: number;
  following: number;
  isVerified?: boolean;
  isVip?: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  goal?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (account: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  restoreSession: () => Promise<boolean>;
  logout: () => Promise<void>;

  updateUser: (updates: Partial<User>) => void;
  addCoins: (amount: number) => void;
}

function mapUser(data: any): User {
  return {
    id: String(data.id),
    email: data.email,
    username: data.username,
    displayName: data.displayName || '',
    avatar: data.avatar || '',
    bio: data.bio || '',
    level: data.level ?? 1,
    vip: data.isVip ?? data.vip ?? false,
    coins: data.coins ?? 0,
    followers: data.followers ?? 0,
    following: data.following ?? 0,
    isVerified: data.isVerified ?? false,
    isVip: data.isVip ?? data.vip ?? false,
  };
}

async function saveTokens(
  accessToken: string,
  refreshToken: string
) {
  await SecureStore.setItemAsync(
    ACCESS_TOKEN_KEY,
    accessToken
  );

  await SecureStore.setItemAsync(
    REFRESH_TOKEN_KEY,
    refreshToken
  );
}

async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

async function refreshSession(): Promise<string | null> {
  try {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      return null;
    }

    const response = await fetch(
      `${API_URL}/api/auth/refresh`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken,
        }),
      }
    );

    if (!response.ok) {
      await clearTokens();
      return null;
    }

    const data = await response.json();

    if (!data.accessToken || !data.refreshToken) {
      await clearTokens();
      return null;
    }

    await saveTokens(
      data.accessToken,
      data.refreshToken
    );

    return data.accessToken;
  } catch (error) {
    console.error('Session refresh error:', error);
    return null;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (
        account: string,
        password: string
      ) => {
        set({ isLoading: true });

        try {
          const response = await fetch(
            `${API_URL}/api/auth/login`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                account: account.trim(),
                password,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok || !data.user) {
            console.error('Login failed:', data);

            set({
              isLoading: false,
            });

            return false;
          }

          await saveTokens(
            data.accessToken,
            data.refreshToken
          );

          set({
            user: mapUser(data.user),
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        } catch (error) {
          console.error(
            'Login network error:',
            error
          );

          set({
            isLoading: false,
          });

          return false;
        }
      },

      register: async (data) => {
        set({ isLoading: true });

        try {
          const response = await fetch(
            `${API_URL}/api/auth/register`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: data.email
                  .trim()
                  .toLowerCase(),

                username: data.username.trim(),

                password: data.password,

                displayName:
                  data.displayName.trim(),

                avatar: data.avatar || null,
                bio: data.bio || null,
                dateOfBirth:
                  data.dateOfBirth || null,
                gender: data.gender || null,
                goal: data.goal || null,
              }),
            }
          );

          const result = await response.json();

          if (!response.ok || !result.user) {
            console.error(
              'Registration failed:',
              result
            );

            set({
              isLoading: false,
            });

            return false;
          }

          await saveTokens(
            result.accessToken,
            result.refreshToken
          );

          set({
            user: mapUser(result.user),
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        } catch (error) {
          console.error(
            'Registration network error:',
            error
          );

          set({
            isLoading: false,
          });

          return false;
        }
      },

      restoreSession: async () => {
        set({ isLoading: true });

        try {
          let accessToken =
            await getAccessToken();

          if (!accessToken) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });

            return false;
          }

          let response = await fetch(
            `${API_URL}/api/auth/me`,
            {
              headers: {
                Authorization:
                  `Bearer ${accessToken}`,
              },
            }
          );

          if (response.status === 401) {
            accessToken =
              await refreshSession();

            if (!accessToken) {
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
              });

              return false;
            }

            response = await fetch(
              `${API_URL}/api/auth/me`,
              {
                headers: {
                  Authorization:
                    `Bearer ${accessToken}`,
                },
              }
            );
          }

          if (!response.ok) {
            await clearTokens();

            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });

            return false;
          }

          const data = await response.json();

          if (!data.user) {
            await clearTokens();

            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });

            return false;
          }

          set({
            user: mapUser(data.user),
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        } catch (error) {
          console.error(
            'Restore session error:',
            error
          );

          set({
            isLoading: false,
          });

          return false;
        }
      },

      logout: async () => {
        try {
          const refreshToken =
            await getRefreshToken();

          if (refreshToken) {
            await fetch(
              `${API_URL}/api/auth/logout`,
              {
                method: 'POST',
                headers: {
                  'Content-Type':
                    'application/json',
                },
                body: JSON.stringify({
                  refreshToken,
                }),
              }
            );
          }
        } catch (error) {
          console.error(
            'Logout request error:',
            error
          );
        } finally {
          await clearTokens();

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      updateUser: (updates) => {
        const { user } = get();

        if (user) {
          set({
            user: {
              ...user,
              ...updates,
            },
          });
        }
      },

      addCoins: (amount) => {
        const { user } = get();

        if (user) {
          set({
            user: {
              ...user,
              coins:
                user.coins + amount,
            },
          });
        }
      },
    }),
    {
      name: 'auth-storage',

      storage: createJSONStorage(
        () => AsyncStorage
      ),

      partialize: (state) => ({
        user: state.user,
        isAuthenticated:
          state.isAuthenticated,
      }),
    }
  )
);
