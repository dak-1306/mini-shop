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

  return res.data;
}

export default {
  login,
};
