import { useQuery } from "@tanstack/react-query";
import { getProducts, getProduct, getCategories } from "@/api/products";

export function useProducts({
  page = 1,
  limit = 0,
  search = "",
  category = "",
} = {}) {
  const skip = Math.max(0, (page - 1) * (limit || 0));

  return useQuery({
    queryKey: ["products", { page, limit, skip, search, category }],
    queryFn: async ({ signal }) =>
      getProducts({ limit, skip, search, category, signal }),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async ({ signal }) => getProduct(id, signal),
    enabled: id != null && id !== "",
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async ({ signal }) => getCategories(signal),
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });
}
