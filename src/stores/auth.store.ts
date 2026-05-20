"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  _hasHydrated: boolean;
  accessToken: string | null;
  admin: AdminUser | null;
  setHasHydrated: (v: boolean) => void;
  setAuth: (accessToken: string, admin: AdminUser) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      _hasHydrated: false,
      accessToken: null,
      admin: null,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setAuth: (accessToken, admin) => set({ accessToken, admin }),
      clearAuth: () => set({ accessToken: null, admin: null }),
    }),
    {
      name: "admin-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
