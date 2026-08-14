import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-railway-url.up.railway.app';

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar: string;
  coins: number;
  diamonds: number;
  vipLevel: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await SecureStore.setItemAsync('token', data.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.refreshToken);
    set({ user: data.user, token: data.accessToken, isAuthenticated: true });
  },

  register: async (userData) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await SecureStore.setItemAsync('token', data.accessToken);
    set({ user: data.user, token: data.accessToken, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('refreshToken');
    set({ user: null, token: null, isAuthenticated: false });
  },

  refreshUser: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) return set({ isLoading: false });
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
