import api from "./axios";

/**
 * Gọi endpoint POST /auth/login
 * - variables: { username, password, expiresInMins }
 * - signal: AbortSignal (react-query truyền vào)
 * - trả về res.data
 */
export async function login(
  { username, password, expiresInMins = 60 } = {},
  signal
) {
  if (!username || !password)
    throw new Error("username và password là bắt buộc");

  const res = await api.post(
    "/auth/login",
    { username, password, expiresInMins },
    {
      signal, // axios sẽ dùng withCredentials mặc định từ instance
    }
  );

  // defensive: ensure no refreshToken stored on client
  try {
    localStorage.removeItem("refreshToken");
  } catch {}

  return res.data;
}

// NEW: logout -> gọi relay server để clear httpOnly cookies / revoke nếu server làm
export async function logout() {
  // let caller handle network errors; only ensure client-side cleanup
  const res = await api.post("/auth/logout");

  // defensive cleanup on client
  try {
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("app-auth");
  } catch {}

  return res.data;
}

export default {
  login,
  logout,
};
