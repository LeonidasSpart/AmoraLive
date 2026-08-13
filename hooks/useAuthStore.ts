import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { API_URL } from "../constants/api";

const ACCESS_TOKEN_KEY = "amora_access_token";
const REFRESH_TOKEN_KEY = "amora_refresh_token";

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
  dateOfBirth?: string;
  gender?: string;
  goal?: string;
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
  logout: () => void | Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  addCoins: (amount: number) => void;
}

const normalizeUser = (user: any): User => ({
  id: user.id,
  email: user.email,
  username: user.username,
  displayName: user.displayName || user.username,
  avatar: user.avatar || "",
  bio: user.bio || "",
  level: user.level || 1,
  vip: user.isVip ?? user.vip ?? false,
  coins: user.coins ?? 0,
  followers: user.followers ?? 0,
  following: user.following ?? 0,
  isVerified: user.isVerified ?? false,
  dateOfBirth: user.dateOfBirth,
  gender: user.gender,
  goal: user.goal,
});

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
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ account: account.trim(), password: password.trim() }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data?.message || "Login failed");
          if (!data?.user) throw new Error("Login response did not contain a user");
          if (!data?.accessToken || !data?.refreshToken) {
            throw new Error("Login response did not contain authentication tokens");
          }
          const user = normalizeUser(data.user);
          await AsyncStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
          await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error: any) {
          console.error("AMORA login error:", error);
          Alert.alert("Login Error", error.message || "Unable to login. Please try again.");
          set({ isLoading: false, isAuthenticated: false });
          return false;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          console.log("🔵 Sending registration to:", `${API_URL}/api/auth/register`);
          const response = await fetch(`${API_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
          console.log("🔵 Registration response:", result);

          if (!response.ok) {
            throw new Error(result?.message || "Registration failed");
          }
          if (!result?.user) {
            throw new Error("Registration response did not contain a user");
          }
          if (!result?.accessToken || !result?.refreshToken) {
            throw new Error("Registration response did not contain authentication tokens");
          }

          const user = normalizeUser(result.user);
          await AsyncStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
          await AsyncStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);

          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error: any) {
          console.error("AMORA registration error:", error);
          Alert.alert("Registration Error", error.message || "Unable to create account. Please try again.");
          set({ isLoading: false, isAuthenticated: false });
          return false;
        }
      },

      logout: async () => {
        try {
          const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
          if (refreshToken) {
            await fetch(`${API_URL}/api/auth/logout`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            });
          }
        } catch (error) {
          console.error("AMORA logout error:", error);
        } finally {
          await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      updateUser: (updates) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, ...updates } });
      },

      addCoins: (amount) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, coins: user.coins + amount } });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
