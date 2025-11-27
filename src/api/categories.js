import api from "./axios";

/**
 * Lấy danh sách categories từ backend và chuẩn hoá về mảng các object:
 * { id, name, slug, ...rest }
 */
export async function getCategories(signal) {
  const res = await api.get("/categories", { signal }).catch(async (err) => {
    // fallback nếu backend expose categories under /products/categories
    if (err?.response?.status === 404) {
      const alt = await api
        .get("/products/categories", { signal })
        .catch(() => ({ data: null }));
      return normalize(alt.data);
    }
    throw err;
  });

  return normalize(res?.data);
}

function normalize(data) {
  if (!data) return [];

  // possible shapes:
  // - { items: [...] }
  // - [{...}, {...}]
  // - { categories: [...] }
  const items = Array.isArray(data)
    ? data
    : Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.categories)
    ? data.categories
    : [];

  return items.map((c) => ({
    id: c._id ?? c.id ?? null,
    name: c.name ?? c.title ?? String(c),
    slug: c.slug ?? c.name?.toLowerCase().replace(/\s+/g, "-") ?? null,
    ...c,
  }));
}

export default { getCategories };
