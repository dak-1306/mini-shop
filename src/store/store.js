import { create } from "zustand";

const useStore = create((set) => ({
  products: [], // Mảng lưu trữ sản phẩm
  // Hàm thêm sản phẩm
  addProduct: (product) =>
    set((state) => ({ products: [...state.products, product] })),
  // Hàm xóa sản phẩm
  removeProduct: (productId) =>
    set((state) => ({
      products: state.products.filter((item) => item.id !== productId),
    })),

  //Thêm giỏ hàng
  cart: [], // Mảng lưu trữ giỏ hàng
  // Hàm thêm vào giỏ hàng
  addToCart: (product) => set((state) => ({ cart: [...state.cart, product] })),
  // Hàm xóa khỏi giỏ hàng
  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== productId),
    })),

  //fetch products từ JSONPlaceholder
  fetchProducts: async () => {
    try {
      const response = await fetch(
        "https://api.escuelajs.co/api/v1/products?limit=20&offset=0"
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Fetched products:", data);
      // Chuyển đổi dữ liệu để phù hợp với cấu trúc sản phẩm của bạn
      const productsData = data.map((item) => ({
        id: item.id,
        name: item.title,
        description: `Description for ${item.slug}`,
        price: item.price, // Giá ngẫu nhiên
        image: item.images[0],
      }));
      set({ products: productsData });
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  },
  //fetch categories từ JSONPlaceholder
  categories: [], // Mảng lưu trữ danh mục
  fetchCategories: async () => {
    try {
      const response = await fetch(
        "https://api.escuelajs.co/api/v1/categories"
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Fetched categories:", data);
      set({ categories: data });
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  },
}));
export default useStore;
