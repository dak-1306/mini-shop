export const mockCategories = [
  {
    id: "c1",
    name: "Fruits",
    image: "https://via.placeholder.com/300x200?text=Fruits",
  },
  {
    id: "c2",
    name: "Vegetables",
    image: "https://via.placeholder.com/300x200?text=Vegetables",
  },
  {
    id: "c3",
    name: "Beverages",
    image: "https://via.placeholder.com/300x200?text=Beverages",
  },
  {
    id: "c4",
    name: "Snacks",
    image: "https://via.placeholder.com/300x200?text=Snacks",
  },
  {
    id: "c5",
    name: "Dairy",
    image: "https://via.placeholder.com/300x200?text=Dairy",
  },
  {
    id: "c6",
    name: "Household",
    image: "https://via.placeholder.com/300x200?text=Household",
  },
];

export const mockProducts = [
  {
    id: "p-c1-1",
    categoryId: "c1",
    name: "Red Apple",
    shortDescription: "Fresh red apple",
    image: "https://via.placeholder.com/300?text=Apple",
    price: 12000,
    stock: 20,
    sku: "APL-01",
  },
  {
    id: "p-c1-2",
    categoryId: "c1",
    name: "Banana",
    shortDescription: "Sweet banana bunch",
    image: "https://via.placeholder.com/300?text=Banana",
    price: 8000,
    stock: 35,
    sku: "BAN-01",
  },
  {
    id: "p-c1-3",
    categoryId: "c1",
    name: "Orange",
    shortDescription: "Juicy orange",
    image: "https://via.placeholder.com/300?text=Orange",
    price: 15000,
    stock: 12,
    sku: "ORG-01",
  },
  {
    id: "p-c2-1",
    categoryId: "c2",
    name: "Carrot",
    shortDescription: "Crunchy carrots",
    image: "https://via.placeholder.com/300?text=Carrot",
    price: 7000,
    stock: 50,
    sku: "CAR-01",
  },
  {
    id: "p-c2-2",
    categoryId: "c2",
    name: "Lettuce",
    shortDescription: "Fresh lettuce",
    image: "https://via.placeholder.com/300?text=Lettuce",
    price: 9000,
    stock: 18,
    sku: "LET-01",
  },
  {
    id: "p-c3-1",
    categoryId: "c3",
    name: "Orange Juice",
    shortDescription: "100% squeezed",
    image: "https://via.placeholder.com/300?text=OJ",
    price: 25000,
    stock: 40,
    sku: "BEV-01",
  },
  {
    id: "p-c3-2",
    categoryId: "c3",
    name: "Mineral Water",
    shortDescription: "Still water 1L",
    image: "https://via.placeholder.com/300?text=Water",
    price: 5000,
    stock: 120,
    sku: "BEV-02",
  },
  {
    id: "p-c4-1",
    categoryId: "c4",
    name: "Potato Chips",
    shortDescription: "Crispy salted",
    image: "https://via.placeholder.com/300?text=Chips",
    price: 18000,
    stock: 60,
    sku: "SNK-01",
  },
  {
    id: "p-c4-2",
    categoryId: "c4",
    name: "Chocolate Bar",
    shortDescription: "Dark chocolate",
    image: "https://via.placeholder.com/300?text=Chocolate",
    price: 22000,
    stock: 25,
    sku: "SNK-02",
  },
  {
    id: "p-c5-1",
    categoryId: "c5",
    name: "Milk 1L",
    shortDescription: "Full cream milk",
    image: "https://via.placeholder.com/300?text=Milk",
    price: 20000,
    stock: 80,
    sku: "DAI-01",
  },
  {
    id: "p-c6-1",
    categoryId: "c6",
    name: "Dish Soap",
    shortDescription: "Lemon scent",
    image: "https://via.placeholder.com/300?text=Soap",
    price: 15000,
    stock: 45,
    sku: "HSE-01",
  },
];

// Mock data phục vụ trang Profile / account
export const mockUsers = [
  {
    id: "u1",
    name: "Nguyễn Văn A",
    username: "nguyenvana",
    email: "a@example.com",
    avatar: "https://i.pravatar.cc/150?img=3",
    role: "buyer", // buyer | seller | admin
    bio: "Yêu thích trái cây tươi và nấu ăn tại nhà.",
    phone: "0901234567",
    address: {
      line1: "123 Đường A",
      line2: "Phường B",
      city: "Hà Nội",
      province: "Hà Nội",
      postalCode: "100000",
      country: "VN",
    },
    stats: {
      ordersCount: 5,
      totalSpent: 580000, // in VND
      wishlistCount: 3,
    },
    favorites: ["p-c1-1", "p-c3-1"],
    paymentMethods: [
      {
        id: "pm1",
        type: "card",
        brand: "VISA",
        last4: "4242",
        expiry: "12/26",
      },
    ],
    orders: [
      {
        id: "o1",
        items: [
          { productId: "p-c1-1", name: "Red Apple", price: 12000, qty: 3 },
          { productId: "p-c3-2", name: "Mineral Water", price: 5000, qty: 2 },
        ],
        subtotal: 46000,
        shipping: 0,
        total: 46000,
        status: "delivered", // pending | shipped | delivered | cancelled
        createdAt: "2024-10-01T10:24:00.000Z",
        shippingAddress: null,
      },
      {
        id: "o2",
        items: [
          { productId: "p-c4-1", name: "Potato Chips", price: 18000, qty: 2 },
        ],
        subtotal: 36000,
        shipping: 0,
        total: 36000,
        status: "processing",
        createdAt: "2025-02-15T14:10:00.000Z",
        shippingAddress: null,
      },
    ],
    createdAt: "2024-01-10T08:00:00.000Z",
  },

  {
    id: "u2",
    name: "Trần Thị B",
    username: "tranthib",
    email: "b@example.com",
    avatar: "https://i.pravatar.cc/150?img=5",
    role: "seller",
    bio: "Người bán rau sạch tại địa phương.",
    phone: "0912345678",
    address: {
      line1: "456 Đường X",
      line2: "Phường Y",
      city: "Hồ Chí Minh",
      province: "TPHCM",
      postalCode: "700000",
      country: "VN",
    },
    stats: {
      productsCount: 12,
      ordersCount: 78,
      rating: 4.7,
    },
    favorites: [],
    paymentMethods: [],
    orders: [], // seller sẽ có orders differently if needed
    createdAt: "2023-07-20T09:30:00.000Z",
  },
];

export function getUserById(id) {
  return mockUsers.find((u) => u.id === id) || null;
}

export default mockUsers;
