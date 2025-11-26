import mongoose from "mongoose";
import bcrypt from "bcrypt";

const SALT_ROUNDS = Number(process.env.PASSWORD_SALT_ROUNDS) || 10;

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
    password: {
      type: String,
      required: true,
      minlength: 6,
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
  },
  { timestamps: true }
);

// Hash password trước khi lưu nếu có thay đổi
UserSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    const hash = await bcrypt.hash(this.password, SALT_ROUNDS);
    this.password = hash;
    return next();
  } catch (err) {
    return next(err);
  }
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
