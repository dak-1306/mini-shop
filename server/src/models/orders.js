import mongoose from "mongoose";

// collection order items (mỗi sản phẩm trong đơn hàng)

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    title: { type: String, required: true },
    thumbnail: { type: String, default: "" },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true, // price tại thời điểm mua
      min: 0,
    },
  },
  // tắt _id cho schema con
  { _id: false }
);

// main order schema (đơn hàng chính)
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: {
      type: [orderItemSchema],
      validate: [(v) => Array.isArray(v) && v.length > 0, "items required"],
    },

    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, default: "" },
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "credit_card", "paypal", "momo", "bank_transfer"],
      default: "cod",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "shipping",
        "delivered",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: process.env.DEFAULT_CURRENCY || "USD",
    },

    note: { type: String, default: "" },
  },
  { timestamps: true }
);

// virtual: tính tổng tiền đơn hàng từ items
orderSchema.virtual("calcTotal").get(function () {
  if (!Array.isArray(this.items)) return 0;
  return this.items.reduce(
    (s, it) => s + (Number(it.price) || 0) * (it.quantity || 0),
    0
  );
});

// pre-validate: đảm bảo totalPrice khớp với items (phòng ngừa gian lận giá từ client)
orderSchema.pre("validate", function (next) {
  const calc =
    this.items && Array.isArray(this.items)
      ? this.items.reduce(
          (s, it) => s + (Number(it.price) || 0) * (it.quantity || 0),
          0
        )
      : 0;
  // chỉ cập nhật nếu khác để tránh vòng lặp vô hạn khi save 
  if (!this.totalPrice || Math.abs(this.totalPrice - calc) > 0.01) {
    this.totalPrice = calc;
  }
  next();
});

// method: đánh dấu đơn hàng đã thanh toán
orderSchema.methods.markPaid = async function (transactionRef) {
  this.paymentStatus = "paid";
  this.orderStatus = "confirmed";
  // có thể lưu transactionRef vào meta nếu cần sau này theo dõi giao dịch hoặc hoàn tiền 
  return this.save();
};

orderSchema.methods.setStatus = async function (status) {
  this.orderStatus = status;
  return this.save();
};

// static: tạo đơn hàng từ giỏ hàng và thông tin vận chuyển và thanh toán 
orderSchema.statics.createFromCart = async function ({
  userId,
  itemsSnapshot,
  shipping,
  paymentMethod,
}) {
  // itemsSnapshot là mảng các sản phẩm đã lấy snapshot từ giỏ hàng tại thời điểm tạo đơn hàng 
  const Order = this;
  const total = itemsSnapshot.reduce(
    (s, it) => s + (Number(it.price) || 0) * (it.quantity || 0),
    0
  );
//   tạo đơn hàng mới 
  const doc = await Order.create({
    user: userId,
    items: itemsSnapshot,
    shippingAddress: shipping,
    paymentMethod,
    paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
    orderStatus: "pending",
    totalPrice: total,
  });
  return doc;
};

// indexes để tối ưu truy vấn
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, paymentStatus: 1 });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
