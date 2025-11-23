import { create } from "zustand";

/**
 * Simple authStore: read initial state from localStorage on init,
 * expose setUser/clearUser/getters. NOT responsible for calling backend.
 */
const STORAGE_KEY = "app-auth";

const readInitial = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, token: null };
    const parsed = JSON.parse(raw);
    return { user: parsed.user ?? null, token: parsed.token ?? null };
  } catch {
    return { user: null, token: null };
  }
};

export const useAuthStore = create((set, get) => ({
  ...readInitial(),

  setUser: (user, token) => set({ user, token }),

  clearUser: () => set({ user: null, token: null }),

  isAuthenticated: () => Boolean(get().user && get().token),
}));

export default useAuthStore;
