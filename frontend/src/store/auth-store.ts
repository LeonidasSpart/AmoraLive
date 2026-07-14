import { create } from 'zustand';
import { authApi, tokenStorage } from '../lib/api';

interface User {
  id: string;
  email: string;
  role: string;
  profile?: {
    firstName: string;
    lastName: string;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ requires2FA?: boolean }>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  hydrate: () => {
    // On app load, trust presence of a token; a real profile fetch (/users/me)
    // should replace this once that endpoint exists — see roadmap notes.
    const hasToken = !!tokenStorage.getAccess();
    set({ isAuthenticated: hasToken });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authApi.login({ email, password });

      if (result.requires2FA) {
        set({ isLoading: false });
        return { requires2FA: true };
      }

      tokenStorage.set(result.tokens.accessToken, result.tokens.refreshToken);
      set({ user: result.user, isAuthenticated: true, isLoading: false });
      return {};
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Login failed', isLoading: false });
      throw err;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authApi.register(payload);
      tokenStorage.set(result.tokens.accessToken, result.tokens.refreshToken);
      set({ user: result.user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Registration failed', isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      tokenStorage.clear();
      set({ user: null, isAuthenticated: false });
    }
  },
}));
