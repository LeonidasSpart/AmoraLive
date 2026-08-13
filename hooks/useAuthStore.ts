import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://api.amoramatch.one';

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

  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addCoins: (amount: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (account, password) => {
        set({ isLoading: true });

        try {
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              account: account.trim(),
              password,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            console.error('Login failed:', data);
            set({ isLoading: false });
            return false;
          }

          if (!data.user) {
            console.error('Login response did not contain a user');
            set({ isLoading: false });
            return false;
          }

          const user: User = {
            id: String(data.user.id),
            email: data.user.email,
            username: data.user.username,
            displayName: data.user.displayName,
            avatar: data.user.avatar || '',
            bio: data.user.bio || '',
            level: data.user.level ?? 1,
            vip: data.user.isVip ?? data.user.vip ?? false,
            coins: data.user.coins ?? 0,
            followers: data.user.followers ?? 0,
            following: data.user.following ?? 0,
            isVerified: data.user.isVerified ?? false,
            isVip: data.user.isVip ?? data.user.vip ?? false,
          };

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        } catch (error) {
          console.error('Login network error:', error);
          set({
            isLoading: false,
          });
          return false;
        }
      },

      register: async (data) => {
        set({ isLoading: true });

        try {
          const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: data.email.trim().toLowerCase(),
              username: data.username.trim(),
              password: data.password,
              displayName: data.displayName.trim(),
              avatar: data.avatar || null,
              bio: data.bio || null,
              dateOfBirth: data.dateOfBirth || null,
              gender: data.gender || null,
              goal: data.goal || null,
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            console.error('Registration failed:', result);
            set({ isLoading: false });
            return false;
          }

          if (!result.user) {
            console.error('Registration response did not contain a user');
            set({ isLoading: false });
            return false;
          }

          const user: User = {
            id: String(result.user.id),
            email: result.user.email,
            username: result.user.username,
            displayName: result.user.displayName,
            avatar: result.user.avatar || '',
            bio: result.user.bio || '',
            level: result.user.level ?? 1,
            vip: result.user.isVip ?? result.user.vip ?? false,
            coins: result.user.coins ?? 0,
            followers: result.user.followers ?? 0,
            following: result.user.following ?? 0,
            isVerified: result.user.isVerified ?? false,
            isVip: result.user.isVip ?? result.user.vip ?? false,
          };

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        } catch (error) {
          console.error('Registration network error:', error);
          set({
            isLoading: false,
          });
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
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
              coins: user.coins + amount,
            },
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
