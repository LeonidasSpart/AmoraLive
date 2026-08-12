import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  level: number;
  vip: boolean;
  coins: number;
  followers: number;
  following: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (account: string, password: string) => Promise<boolean>;
  register: (data: Partial<User> & { password: string }) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addCoins: (amount: number) => void;
}

const MOCK_USERS: Record<string, { user: User; password: string }> = {};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (account: string, password: string) => {
        // Simulate API call
        await new Promise((res) => setTimeout(res, 800));

        const found = MOCK_USERS[account];
        if (found && found.password === password) {
          set({ user: found.user, isAuthenticated: true });
          return true;
        }

        // Auto-create demo account for testing
        const demoUser: User = {
          id: account,
          username: `user_${account}`,
          displayName: 'Leonidas',
          avatar: 'https://i.pravatar.cc/150?u=' + account,
          bio: 'Live streamer & content creator',
          level: 1,
          vip: true,
          coins: 200,
          followers: 1240,
          following: 85,
        };

        MOCK_USERS[account] = { user: demoUser, password };
        set({ user: demoUser, isAuthenticated: true });
        return true;
      },

      register: async (data) => {
        await new Promise((res) => setTimeout(res, 1000));
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          username: data.username || 'newuser',
          displayName: data.displayName || 'New User',
          avatar: data.avatar || `https://i.pravatar.cc/150?u=${Date.now()}`,
          bio: '',
          level: 1,
          vip: false,
          coins: 200,
          followers: 0,
          following: 0,
        };
        MOCK_USERS[data.username || ''] = { user: newUser, password: data.password };
        set({ user: newUser, isAuthenticated: true });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateUser: (updates) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },

      addCoins: (amount) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, coins: user.coins + amount } });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
