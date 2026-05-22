"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthStatus, AuthTokens } from "@/auth/authTypes";
import { STORAGE_KEY } from "@/auth/authConstants";

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  _hasHydrated: boolean;
  status: AuthStatus;
  accessToken: string | null;
  accessTokenExpiresAt: number | null;
  refreshToken: string | null;
  admin: AdminUser | null;

  setHasHydrated: (v: boolean) => void;
  setStatus: (status: AuthStatus) => void;
  setTokens: (tokens: AuthTokens, admin?: AdminUser) => void;
  setAccessToken: (accessToken: string, expiresAt: number) => void;
  setRefreshToken: (refreshToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      _hasHydrated: false,
      status: "loading",
      accessToken: null,
      accessTokenExpiresAt: null,
      refreshToken: null,
      admin: null,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      setStatus: (status) => set({ status }),

      setTokens: (tokens, admin) => {
        set({
          accessToken: tokens.accessToken,
          accessTokenExpiresAt: tokens.accessTokenExpiresAt,
          refreshToken: tokens.refreshToken,
          admin: admin ?? null,
          status: "authenticated",
        });
      },

      setAccessToken: (accessToken, expiresAt) => {
        set({ accessToken, accessTokenExpiresAt: expiresAt, status: "authenticated" });
      },

      setRefreshToken: (refreshToken) => {
        set({ refreshToken });
      },

      clearAuth: () => {
        set({
          accessToken: null,
          accessTokenExpiresAt: null,
          refreshToken: null,
          admin: null,
          status: "unauthenticated",
        });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        admin: state.admin,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.setHasHydrated(true);
        if (!state.refreshToken) {
          state.clearAuth();
        }
        // If refreshToken present, status stays "loading" until authBootstrap validates it
      },
    },
  ),
);
