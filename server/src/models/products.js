import mongoose from "mongoose";

// Product Schema

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    shortDescription: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    images: {
      type: [String],
      default: [],
    },

    thumbnail: {
      type: String,
      default: "",
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    brand: {
      type: String,
      default: "",
    },

    // sellerId không bắt buộc vì sản phẩm import từ yummy có thể không có seller nội bộ
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    tags: {
      type: [String],
      default: [],
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    // external id từ yummy (hoặc source bên ngoài) — dùng để upsert/so khớp, không thay thế _id
    externalId: {
      type: Number, // hoặc String nếu source dùng string ids
      index: true,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// text index chỉ cho text fields
productSchema.index({ title: "text", description: "text" });

// separate multikey index for tags (supports arrays)
productSchema.index({ tags: 1 });

// pre-save: nếu không có thumbnail, dùng ảnh đầu tiên làm thumbnail
productSchema.pre("save", function (next) {
  if (
    (!this.thumbnail || this.thumbnail === "") &&
    Array.isArray(this.images) &&
    this.images.length > 0
  ) {
    this.thumbnail = this.images[0];
  }
  next();
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
