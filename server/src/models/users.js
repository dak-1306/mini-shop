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

    // Thêm trường isVerified để lưu trạng thái xác thực email
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Thêm các trường liên quan email verification:
    // - emailVerifyToken: lưu hash của token (sha256)
    // - emailVerifyExpires: thời gian hết hạn token
    // - emailVerifySentAt: thời điểm gửi token (dùng để tránh spam resend)
    emailVerifyToken: { type: String, default: null },
    emailVerifyExpires: { type: Date, default: null },
    emailVerifySentAt: { type: Date, default: null },

    // --- Các trường liên quan bảo mật login / refresh token ---
    // Số lần đăng nhập thất bại liên tiếp
    failedLoginAttempts: { type: Number, default: 0 },

    // Nếu tài khoản bị khóa tạm thời, lưu thời điểm mở khóa
    lockUntil: { type: Date, default: null },

    // Hash của refresh token hiện tại (sha256) -> không lưu plain token
    refreshTokenHash: { type: String, default: null },
    refreshTokenExpires: { type: Date, default: null },
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

/**
 * Kiểm tra tài khoản đang bị khóa không
 * - Trả true nếu lockUntil tồn tại và lớn hơn thời điểm hiện tại
 */
UserSchema.methods.isAccountLocked = function () {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
};

/**
 * Tăng failedLoginAttempts và set lockUntil khi đạt ngưỡng
 * - Sử dụng env MAX_FAILED_LOGIN_ATTEMPTS (mặc định 5)
 * - Sử dụng env ACCOUNT_LOCK_TIME_MS (mặc định 30 phút)
 *
 * Trả về document sau khi save
 */
UserSchema.methods.incLoginAttempts = async function () {
  const MAX_FAILED = Number(process.env.MAX_FAILED_LOGIN_ATTEMPTS) || 5;
  const LOCK_TIME = Number(process.env.ACCOUNT_LOCK_TIME_MS) || 30 * 60 * 1000; // 30 phút

  // Nếu đã bị khóa và thời gian khóa đã hết -> reset counters
  if (this.lockUntil && this.lockUntil.getTime() <= Date.now()) {
    this.failedLoginAttempts = 1;
    this.lockUntil = null;
    return this.save();
  }

  // Tăng attempts
  this.failedLoginAttempts = (this.failedLoginAttempts || 0) + 1;

  // Nếu vượt ngưỡng, khóa tài khoản tạm thời
  if (this.failedLoginAttempts >= MAX_FAILED) {
    this.lockUntil = new Date(Date.now() + LOCK_TIME);
  }

  return this.save();
};

/**
 * Reset failed login counters (sau khi đăng nhập thành công)
 */
UserSchema.methods.resetFailedLogins = async function () {
  this.failedLoginAttempts = 0;
  this.lockUntil = null;
  return this.save();
};

// instance method: compare mật khẩu
UserSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

// sanitize output khi toJSON / toObject để không trả password hoặc token sensitive
UserSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  delete obj.refreshTokenHash;
  delete obj.emailVerifyToken;
  return obj;
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
