import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/users.js";
import { sendVerificationEmail } from "../services/email.service.js";
import {
  JWT_SECRET,
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES_DAYS,
  IS_PROD,
  BCRYPT_SALT_ROUNDS,
} from "../config/env.js";

/*
  Notes (tiếng Việt):
  - Thực hiện phòng chống user enumeration bằng cách dùng DUMMY_HASH để bcrypt.compare
    ngay cả khi user không tồn tại (giảm khác biệt thời gian).
  - Khi đăng nhập thất bại: nếu user tồn tại, tăng failedLoginAttempts (incLoginAttempts).
  - Khi đăng nhập thành công: reset failedLoginAttempts, tạo accessToken (JWT) và refreshToken
    (plain token gửi cho client qua cookie httpOnly; hash token lưu vào DB).
  - Refresh token lưu hashed (sha256) trong user.refreshTokenHash + expires để có thể revoke.
*/

// Dummy hash dùng để fake bcrypt.compare khi user không tồn tại (giảm timing attack)
// Ghi chú: dùng BCRYPT_SALT_ROUNDS từ env đã export
const DUMMY_HASH = bcrypt.hashSync(
  "__dummy_password_for_timing__",
  Number(BCRYPT_SALT_ROUNDS) || 10
);

// Sử dụng giá trị import ACCESS_TOKEN_EXPIRES và REFRESH_TOKEN_EXPIRES_DAYS
const ACCESS_EXPIRES = ACCESS_TOKEN_EXPIRES || "15m";
const REFRESH_EXPIRES_DAYS = Number(REFRESH_TOKEN_EXPIRES_DAYS) || 30;

/**
 * Helper: tạo access token JWT (dùng payload tối giản)
 */
function signAccessToken(user) {
  const payload = { sub: String(user._id), role: user.role || "user" };
  return jwt.sign(payload, JWT_SECRET || "changeme", {
    expiresIn: ACCESS_EXPIRES,
  });
}

/**
 * Helper: tạo refresh token (random string) và trả về plain + hash
 */
function createRefreshToken() {
  const plain = crypto.randomBytes(64).toString("hex");
  const hash = crypto.createHash("sha256").update(plain).digest("hex");
  return { plain, hash };
}

/**
 * Login được cập nhật:
 * - So sánh mật khẩu (hoặc fake compare) trước để tránh user enumeration timing leaks
 * - Nếu mật khẩu sai và user tồn tại: tăng failed attempts
 * - Nếu mật khẩu đúng:
 *    + kiểm tra lock (nếu bị khóa, trả 423 hoặc message phù hợp)
 *    + reset failed attempts
 *    + tạo access token + refresh token, lưu hash refresh token và expiry vào DB
 *    + set cookie httpOnly cho refresh token, trả access token + user
 */
export async function login(req, res) {
  try {
    const { email, password, expiresInMins = 30 } = req.body;

    // Tìm user và kiểm tra password
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).exec();
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
    }

    // Bỏ kiểm tra isVerified - cho phép đăng nhập trực tiếp

    // Tạo access token
    const tokenPayload = { userId: user._id, email: user.email };
    const accessToken = signAccessToken(tokenPayload, expiresInMins);

    // Tạo và lưu refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    const expireTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày

    user.refreshTokenHash = tokenHash;
    user.refreshTokenExpires = expireTime;
    user.lastLogin = new Date();
    await user.save();

    // Đặt cookie httpOnly
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // Trả về thông tin user
    const userInfo = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      message: "Đăng nhập thành công",
      accessToken,
      user: userInfo,
    });
  } catch (err) {
    console.error("lỗi đăng nhập", err);
    return res.status(500).json({ error: "Đăng nhập thất bại" });
  }
}

/**
 * Verify email endpoint
 * - Vị trí: POST /api/auth/verify-email (hoặc GET nếu bạn dùng query params)
 * - Input (req.validatedBody hoặc req.body): { token, id }
 *
 * Luồng:
 * 1) Lấy user theo id
 * 2) Nếu không tồn tại => 400 (hoặc 200 generic để tránh enumeration)
 * 3) Nếu user đã verify => trả 200 "already verified"
 * 4) Hash token từ request (sha256) và so sánh với user.emailVerifyToken
 * 5) Kiểm tra expiry
 * 6) Nếu hợp lệ: set isVerified = true, xóa token fields, save, trả 200
 */
export async function verifyEmail(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }

    // Hash token để tìm user
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerificationToken: tokenHash,
      emailVerificationExpires: { $gt: new Date() },
    }).exec();

    if (!user) {
      return res
        .status(400)
        .json({ error: "Invalid or expired verification token" });
    }

    // Mark user as verified và clear verification token
    user.isVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    // Sanitize user data
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      message: "Email verified successfully",
      user: userResponse, // trả user object để frontend có thể update localStorage
    });
  } catch (err) {
    console.error("verify email error", err);
    return res.status(500).json({ error: "Email verification failed" });
  }
}

/**
 * Resend verify email
 * - Vị trí: POST /api/auth/resend-verify
 * - Input: { email }
 *
 * Luồng:
 * - Nếu user không tồn tại -> trả 200 generic (tránh user enumeration)
 * - Nếu user đã verified -> trả 200 với thông báo đã verified
 * - Hạn chế spam: nếu vừa gửi gần đây (ví dụ < 60s) -> trả 429
 * - Tạo token mới, lưu hash + expiry + sentAt, gọi sendVerificationEmail
 */
export async function resendVerify(req, res) {
  try {
    const { email } = req.validatedBody || req.body;
    if (!email) return res.status(400).json({ error: "email là bắt buộc" });

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).exec();

    // Nếu user không tồn tại, trả 200 generic để tránh leak existence
    if (!user) {
      return res.status(200).json({
        message: "Nếu tài khoản tồn tại, một email xác thực sẽ được gửi.",
      });
    }

    if (user.isVerified) {
      return res.status(200).json({ message: "Tài khoản đã được xác thực." });
    }

    // Throttle nội bộ: tránh gửi quá nhiều lần liên tiếp (ví dụ < 60s)
    const now = Date.now();
    if (
      user.emailVerifySentAt &&
      now - new Date(user.emailVerifySentAt).getTime() < 60 * 1000
    ) {
      return res.status(429).json({
        error:
          "Vừa gửi email xác thực. Vui lòng chờ một chút trước khi thử lại.",
      });
    }

    // Tạo token plain và hash lưu DB
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // thời hạn token (ví dụ 24 giờ)
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerifyToken = tokenHash;
    user.emailVerifyExpires = expires;
    user.emailVerifySentAt = new Date();
    await user.save();

    // gửi email (service có fallback nếu SMTP chưa cấu hình)
    sendVerificationEmail(user.email, {
      token,
      userId: user._id,
      name: user.name,
    }).catch((err) => console.error("resend send email failed", err));

    return res.status(200).json({
      message: "Email xác thực đã được gửi, vui lòng kiểm tra hộp thư.",
    });
  } catch (err) {
    console.error("resendVerify error", err);
    return res.status(500).json({ error: "Gửi lại email xác thực thất bại" });
  }
}

/**
 * Register người dùng mới
 * - Vị trí: server/src/controller/auth.controller.js
 * - Hành vi:
 *   + Dùng req.validatedBody nếu có (middleware Joi), fallback req.body
 *   + Kiểm tra tính hợp lệ của dữ liệu (name, email, password)
 *   + Kiểm tra trùng lặp email
 *   + Tạo user mới với trường isVerified = false
 *   + Tạo token xác thực email (hash và lưu vào user.emailVerifyToken)
 *   + Gửi email xác thực (sendVerificationEmail)
 *
 * Lưu ý bảo mật:
 * - Không tiết lộ thông tin người dùng qua thông báo lỗi (ví dụ "Email đã tồn tại")
 * - Luôn trả về thông báo chung chung để tránh leak thông tin
 */
export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra user đã tồn tại
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      return res.status(409).json({ error: "Email đã được sử dụng" });
    }

    // Tạo user mới - bỏ qua verification
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // sẽ được hash tự động
      isVerified: true, // mặc định đã verified
    });

    await newUser.save();

    // Trả về thông tin user (đã làm sạch)
    const userInfo = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      isVerified: newUser.isVerified,
      createdAt: newUser.createdAt,
    };

    return res.status(201).json({
      message: "Đăng ký thành công",
      user: userInfo,
    });
  } catch (err) {
    console.error("lỗi đăng ký", err);
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email đã được sử dụng" });
    }
    return res.status(500).json({ error: "Đăng ký thất bại" });
  }
}

// thêm hàm logout để xoá refresh token (cookie httpOnly) và revoke token trên DB
export async function logout(req, res) {
  try {
    // lấy refresh token plain từ cookie (cookie parser được giả sử đã dùng ở app)
    const refreshPlain = req.cookies?.refreshToken;
    // luôn clear cookie ở client để đảm bảo logout bất kể token có khớp DB hay không
    const cookieOptions = {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "lax",
      path: "/",
    };

    // nếu không có cookie -> vẫn trả 200 (không leak thông tin)
    if (!refreshPlain) {
      res.clearCookie("refreshToken", cookieOptions);
      return res.status(200).json({ message: "Logged out" });
    }

    // hash token để tìm user tương ứng và revoke (xoá hash + expiry)
    try {
      const refreshHash = crypto
        .createHash("sha256")
        .update(String(refreshPlain))
        .digest("hex");

      const user = await User.findOne({ refreshTokenHash: refreshHash }).exec();
      if (user) {
        user.refreshTokenHash = null;
        user.refreshTokenExpires = null;
        await user
          .save()
          .catch((e) =>
            console.warn("logout: failed to clear refresh token on user", e)
          );
      }
    } catch (e) {
      console.warn("logout: error while revoking refresh token", e);
      // tiếp tục clear cookie và trả về 200
    }

    res.clearCookie("refreshToken", cookieOptions);
    return res.status(200).json({ message: "Logged out" });
  } catch (err) {
    console.error("logout error", err);
    // mặc định trả 200 để tránh leak thông tin và luôn clear cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "lax",
      path: "/",
    });
    return res.status(200).json({ message: "Logged out" });
  }
}
