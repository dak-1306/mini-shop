// Model Cart
import mongoose from "mongoose";

// Schema cho mục trong giỏ hàng
const cartItemSchema = new mongoose.Schema(
  {
    // allow Number (dummyjson) or ObjectId for real products
    productId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      // ref: "Product", // optional: only if ObjectId
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    selected: {
      type: Boolean,
      default: true,
    },
    // snapshot fields (at the time of adding to cart)
    title: { type: String },
    price: { type: Number },
    thumbnail: { type: String },
  },
  { _id: false }
);

// Schema cho giỏ hàng
const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

// Helper: tìm hoặc tạo giỏ hàng cho user
cartSchema.statics.getOrCreateByUser = async function (userId) {
  const Cart = this;
  let cart = await Cart.findOne({ userId });
  if (cart) return cart;
  return Cart.create({ userId, items: [] });
};

// Helper: thêm mục vào giỏ hàng (atomic-ish)
cartSchema.statics.addItem = async function (userId, product, qty = 1) {
  const Cart = this;
  const pid = product?.id ?? product;
  // validate
  if (!pid) throw new Error("product id required");
  if (qty <= 0) throw new Error("quantity must be positive");
  // thử cập nhật mục đã tồn tại trong giỏ hàng (nếu có) bằng cách tăng số lượng lên qty
  const updated = await Cart.findOneAndUpdate(
    { userId, "items.productId": pid },
    { $inc: { "items.$.quantity": qty } },
    { new: true }
  );
  if (updated) return updated;

  // nếu mục chưa tồn tại, thêm mục mới vào giỏ hàng (tạo giỏ hàng nếu chưa có)
  const item = {
    productId: pid,
    quantity: qty,
    title: product?.title ?? product?.name,
    price: product?.price,
    thumbnail:
      product?.thumbnail ??
      (Array.isArray(product?.images) ? product.images[0] : undefined),
  };
  return Cart.findOneAndUpdate(
    { userId },
    { $push: { items: item } },
    { new: true, upsert: true }
  );
};

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
export default Cart;
