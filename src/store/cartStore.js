import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Cart store
 * item shape: { id, name, price, image?, sku?, qty, ... }
 */
const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // add product (if exists tăng qty)
      addItem: (product, qty = 1) =>
        set((state) => {
          const q = Math.max(1, Number(qty) || 1);
          const idx = state.items.findIndex((i) => i.id === product.id);
          if (idx >= 0) {
            const items = state.items.map((it, i) =>
              i === idx ? { ...it, qty: it.qty + q } : it
            );
            return { items };
          }
          return { items: [...state.items, { ...product, qty: q }] };
        }),

      // remove item by id
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((it) => it.id !== id) })),

      // set exact quantity (if qty <= 0 => remove)
      updateItemQuantity: (id, qty) =>
        set((state) => {
          const q = Math.max(0, Number(q) || 0);
          if (q === 0)
            return { items: state.items.filter((it) => it.id !== id) };
          return {
            items: state.items.map((it) =>
              it.id === id ? { ...it, qty: q } : it
            ),
          };
        }),

      // convenience: increase qty
      increase: (id, delta = 1) =>
        set((state) => ({
          items: state.items.map((it) =>
            it.id === id ? { ...it, qty: it.qty + Math.max(1, delta) } : it
          ),
        })),

      // convenience: decrease qty (remove if <= 0)
      decrease: (id, delta = 1) =>
        set((state) => {
          const items = state.items
            .map((it) =>
              it.id === id
                ? { ...it, qty: Math.max(0, it.qty - Math.max(1, delta)) }
                : it
            )
            .filter((it) => it.qty > 0);
          return { items };
        }),

      // clear cart
      clearCart: () => set({ items: [] }),

      // selectors / helpers (call as get().getTotal() or use selectors in components)
      getTotal: () =>
        get().items.reduce(
          (acc, it) => acc + (Number(it.price) || 0) * (it.qty || 0),
          0
        ),

      getCount: () => get().items.reduce((acc, it) => acc + (it.qty || 0), 0),

      // replace items (useful for hydrate/testing)
      setItems: (items = []) => set({ items }),
    }),
    {
      name: "cart-storage", // localStorage key
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export { useCartStore };
