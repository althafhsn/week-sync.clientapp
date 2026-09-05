"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/types";

type AuthState = {
  signedIn: boolean;
  currentUser: User | null;
  hydrated: boolean;
  signIn: (user: User) => void;
  signOut: () => void;
  setHydrated: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      signedIn: false,
      currentUser: null,
      hydrated: false,
      signIn: (user) => set({ signedIn: true, currentUser: user }),
      signOut: () => set({ signedIn: false, currentUser: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "weekly-review-hub-auth",
      partialize: (state) => ({
        signedIn: state.signedIn,
        currentUser: state.currentUser,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
