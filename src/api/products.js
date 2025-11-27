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
    const res = await api.get("/products/search", { params, signal });
    return res.data;
  }

  // Nếu có category slug -> gọi endpoint /products/category/:slug
  if (category) {
    const res = await api.get(
      `/products/category/${encodeURIComponent(category)}`,
      {
        params,
        signal,
      }
    );
    return res.data;
  }

  // Mặc định lấy tất cả
  const res = await api.get("/products", { params, signal });
  return res.data;
}

export async function getProduct(id, signal) {
  if (id == null || id === "") throw new Error("Product id is required");
  const res = await api.get(`/products/${encodeURIComponent(id)}`, { signal });
  return res.data;
}

/**
 * Lấy danh sách categories từ /api/categories
 */
export async function getCategories(signal) {
  const res = await api.get("/categories", { signal });
  // backend category.controller trả { meta, items } -> return items array
  if (res?.data?.items && Array.isArray(res.data.items)) return res.data.items;
  if (Array.isArray(res.data)) return res.data;
  return [];
}

export default {
  getProducts,
  getProduct,
  getCategories,
};
