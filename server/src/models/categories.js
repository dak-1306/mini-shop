// src/models/category.js
import mongoose from "mongoose";

// helper: tạo slug từ tên
function slugify(str = "") {
  return String(str)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

// Schema danh mục sản phẩm
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 1,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
    },

    icon: {
      type: String, // URL hoặc tên file SVG
      default: "",
    },

    image: {
      type: String, // banner hoặc preview category
      default: "",
    },

    imageAlt: {
      type: String,
      default: "",
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },

    priority: {
      type: Number,
      default: 0,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// text index để hỗ trợ tìm kiếm nhanh
categorySchema.index({ name: "text", description: "text" });

// pre-validate: tự động tạo slug từ tên nếu chưa có slug hoặc chuẩn hóa slug nếu đã có slug
categorySchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  } else if (this.slug) {
    this.slug = slugify(this.slug);
  }
  next();
});

// method:

// chuyển đổi document thành JSON, loại bỏ trường __v không cần thiết
categorySchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.__v;
  return obj;
};

const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);
export default Category;
