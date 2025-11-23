import api from "./axios";

/**
 * Lưu ý: axios hỗ trợ AbortSignal (signal) trong options
 */
export async function getProducts({
  limit = 0,
  skip = 0,
  search,
  category, // slug, ví dụ "beauty"
  signal,
} = {}) {
  const params = {};
  if (limit) params.limit = limit;
  if (skip) params.skip = skip;

  // Nếu có search -> sử dụng /search?q=
  if (search) {
    params.q = search;
    const res = await api.get("/search", { params, signal });
    return res.data; // { products, total, skip, limit }
  }

  // Nếu có category -> gọi endpoint /category/{slug}
  if (category) {
    const res = await api.get(`/category/${encodeURIComponent(category)}`, {
      params,
      signal,
    });
    return res.data; // dummyjson trả về { products, total, skip, limit }
  }

  // Mặc định lấy tất cả
  const res = await api.get("/", { params, signal });
  return res.data;
}

export async function getProduct(id, signal) {
  if (id == null || id === "") throw new Error("Product id is required");
  const res = await api.get(`/${encodeURIComponent(id)}`, { signal });
  return res.data;
}

export async function getCategories(signal) {
  const res = await api.get("/categories", { signal });
  return res.data; // mảng slug/name nếu dùng endpoint khác; dummyjson trả mảng slug strings
}

export default {
  getProducts,
  getProduct,
  getCategories,
};
