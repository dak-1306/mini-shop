import api from "./axios";

/**
 * Lấy cart theo id
 * @param {string|number} id
 * @param {AbortSignal} signal
 * @returns Promise resolving to cart object
 */
export async function getCart(id, signal) {
  if (id == null || id === "") throw new Error("cart id is required");
  const res = await api.get(`/carts/${encodeURIComponent(id)}`, { signal });
  return res.data;
}

/**
 * Tạo/checkout cart (relay server có /api/checkout -> forward tới carts/add)
 * payload: { items: [...], address?, ... }
 */
export async function checkout(payload, signal) {
  const res = await api.post("/checkout", payload, { signal });
  return res.data;
}

/**
 * Helper: lấy tất cả carts (nếu server/third-party hỗ trợ)
 * fallback: gọi /carts
 */
export async function getCarts(params = {}, signal) {
  const res = await api.get("/carts", { params, signal });
  return res.data;
}

export default {
  getCart,
  getCarts,
  checkout,
};
