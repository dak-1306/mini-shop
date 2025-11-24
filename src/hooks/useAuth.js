import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login as apiLogin } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";

export default function useAuth() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);

  const user = useAuthStore((s) => s.user);
  const auth = { user }; // token removed

  const mutation = useMutation({
    mutationFn: async (variables, { signal }) => {
      return apiLogin(variables, signal);
    },
    onSuccess(data) {
      // parse user from body; do NOT store token (cookie is httpOnly)
      const userFromBody =
        data?.user ??
        (() => {
          const { token, accessToken, ...rest } = data || {};
          return Object.keys(rest).length ? rest : null;
        })();

      // persist only user in store (authStore will persist to localStorage)
      setUser(userFromBody);

      try {
        qc.invalidateQueries({ queryKey: ["me"] });
      } catch {}
    },
  });

  const login = React.useCallback(
    (variables) => mutation.mutate(variables),
    [mutation]
  );
  const logout = React.useCallback(() => {
    clearUser();
    try {
      qc.invalidateQueries({ queryKey: ["me"] });
    } catch {}
  }, [clearUser, qc]);

  return { auth, login, logout, mutation };
}
