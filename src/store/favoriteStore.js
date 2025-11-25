import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * favoriteStore
 * item minimal shape: { id, name, image, addedAt }
 */
export const useFavoriteStore = create(
  persist(
    (set, get) => ({
      items: [],

      addFavorite: (product) =>
        set((state) => {
          const id = product?.id ?? product;
          if (!id) return state;
          const exists = state.items.find((i) => String(i.id) === String(id));
          if (exists) return state;
          const item = {
            id,
            name: product?.title ?? product?.name ?? "",
            image:
              product?.thumbnail ??
              (Array.isArray(product?.images) ? product.images[0] : undefined),
            addedAt: Date.now(),
            price: product?.price,
          };
          return { items: [item, ...state.items] };
        }),

      removeFavorite: (id) =>
        set((state) => ({
          items: state.items.filter((i) => String(i.id) !== String(id)),
        })),

      toggleFavorite: (productOrId) =>
        set((state) => {
          const id = productOrId?.id ?? productOrId;
          if (!id) return state;
          const exists = state.items.find((i) => String(i.id) === String(id));
          if (exists) {
            return {
              items: state.items.filter((i) => String(i.id) !== String(id)),
            };
          }
          const item = {
            id,
            name:
              typeof productOrId === "object"
                ? productOrId.title ?? productOrId.name ?? ""
                : "",
            image:
              typeof productOrId === "object"
                ? productOrId.thumbnail ??
                  (Array.isArray(productOrId.images)
                    ? productOrId.images[0]
                    : undefined)
                : undefined,
            addedAt: Date.now(),
            price:
              typeof productOrId === "object" ? productOrId.price : undefined,
          };
          return { items: [item, ...state.items] };
        }),

      isFavorite: (id) =>
        Boolean(get().items.find((i) => String(i.id) === String(id))),

      clearFavorites: () => set({ items: [] }),

      setItems: (items = []) => set({ items }),
    }),
    {
      name: "favorite-storage", // localStorage key
      partialize: (state) => ({ items: state.items }),
    }
  )
);
