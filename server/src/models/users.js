import mongoose from "mongoose";
import bcrypt from "bcrypt";

// thống nhất tên biến môi trường: BCRYPT_SALT_ROUNDS
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

// Schema cho địa chỉ của user
const AddressSchema = new mongoose.Schema(
  {
    fullName: { type: String },
    phone: { type: String },
    province: { type: String },
    district: { type: String },
    ward: { type: String },
    detail: { type: String },
  },
  { _id: false }
);

// User Schema chính
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // store hashed password only
    // tăng minlength để khớp với kiểm tra ở controller (8)
    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    avatar: {
      type: String,
      default: null,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },

    phone: {
      type: String,
      default: null,
    },

    addresses: {
      type: [AddressSchema],
      default: [],
    },

    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // thêm trường token xác thực email (nếu cần)
    emailVerifyToken: { type: String, default: null },
    emailVerifyExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

// Hash password trước khi lưu nếu có thay đổi
UserSchema.pre("save", async function () {
  // nếu password không thay đổi thì không làm gì
  if (!this.isModified("password")) return;
  // hash và gán — nếu có lỗi sẽ bị reject và Mongoose xử lý
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

// instance method: compare mật khẩu
UserSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

// sanitize output khi toJSON / toObject để không trả password
UserSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  return obj;
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
