import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
} from "@/api/auth";
import { useAuthStore } from "@/store/authStore";

export default function useAuth() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);

  const user = useAuthStore((s) => s.user);
  const auth = { user };

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (variables, { signal }) => {
      return apiLogin(variables, signal);
    },
    onSuccess(data) {
      if (data?.user) {
        setUser(data.user);
      }
      try {
        qc.invalidateQueries({ queryKey: ["me"] });
      } catch {}
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (variables, { signal }) => {
      return apiRegister(variables, signal);
    },
    onSuccess(data) {
      if (data?.user) {
        setUser(data.user); // Lưu user ngay sau khi đăng ký
      }
      try {
        qc.invalidateQueries({ queryKey: ["me"] });
      } catch {}
    },
  });

  const login = React.useCallback(
    (variables) => loginMutation.mutate(variables),
    [loginMutation]
  );

  const register = React.useCallback(
    (variables) => registerMutation.mutate(variables),
    [registerMutation]
  );

  const logout = React.useCallback(async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.warn("lỗi logout", err);
    } finally {
      clearUser();
      try {
        qc.invalidateQueries({ queryKey: ["me"] });
      } catch {}
    }
  }, [clearUser, qc]);

  return {
    auth,
    login,
    logout,
    register,
    loginMutation,
    registerMutation,
  };
}
