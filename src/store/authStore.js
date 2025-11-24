import { create } from "zustand";

const STORAGE_KEY = "app-auth";

const readInitial = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null };
    const parsed = JSON.parse(raw);
    return { user: parsed.user ?? null };
  } catch {
    return { user: null };
  }
};

export const useAuthStore = create((set, get) => ({
  ...readInitial(),

  // persist only user
  setUser: (user) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user }));
    } catch {}
    set({ user });
  },

  clearUser: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    set({ user: null });
  },

  isAuthenticated: () => Boolean(get().user),
}));

// sync across tabs
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      try {
        const parsed = e.newValue ? JSON.parse(e.newValue) : null;
        useAuthStore.setState({
          user: parsed?.user ?? null,
        });
      } catch {}
    }
  });
}

export default useAuthStore;
