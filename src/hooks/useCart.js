import { useQuery } from "@tanstack/react-query";
import { getCart } from "@/api/cart";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useEffect } from "react";

/**
 * useCart(id?) - nếu id không truyền sẽ dùng authStore.user.id
 * returns react-query result
 */
export default function useCart(idProp) {
  const storeUser = useAuthStore((s) => s.user);
  const id = idProp ?? storeUser?.id;
  const setItemsFromServer = useCartStore((s) => s.setItemsFromServer);
  const mergeWithServer = useCartStore((s) => s.mergeWithServer);

  const query = useQuery({
    queryKey: ["cart", id],
    queryFn: ({ signal }) => getCart(id, signal),
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minute
    retry: 1,
  });

  // hydrate / merge when server data arrives
  useEffect(() => {
    if (!query.data) return;
    // if local cart is empty -> replace, else merge
    const localCount = useCartStore.getState().getCount();
    if (localCount === 0) {
      setItemsFromServer(query.data);
    } else {
      // merge strategy: sum quantities
      mergeWithServer(query.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data]);

  return query;
}
