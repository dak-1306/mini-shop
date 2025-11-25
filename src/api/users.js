import api from "./axios";

/**
 * Lấy user theo id (relay server cung cấp /api/users/:id)
 * signal là AbortSignal từ react-query
 */
export async function getUser(id, signal) {
  if (!id) throw new Error("user id is required");
  const res = await api.get(`/users/${encodeURIComponent(id)}`, { signal });
  return res.data;
}

export default { getUser };
