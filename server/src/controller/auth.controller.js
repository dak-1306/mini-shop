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
    const { email, password } = req.validatedBody || req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email & password required" });

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).exec();

    // So sánh mật khẩu (nếu user tồn tại dùng comparePassword, nếu không dùng fake DUMMY_HASH)
    let passwordMatches = false;
    if (user) {
      passwordMatches = await user.comparePassword(password);
    } else {
      await bcrypt.compare(password, DUMMY_HASH).catch(() => {});
      passwordMatches = false;
    }

    if (!passwordMatches) {
      if (user) {
        await user
          .incLoginAttempts()
          .catch((e) => console.warn("incLoginAttempts failed", e));
        console.warn(
          `[auth] failed login for user=${user.email} attempts=${user.failedLoginAttempts}`
        );
        if (user.isAccountLocked()) {
          console.warn(
            `[auth] user locked: ${user.email} until=${user.lockUntil}`
          );
        }
      } else {
        console.warn(
          `[auth] failed login attempt for non-existent email=${normalizedEmail}`
        );
      }
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // NEW: Chặn login nếu email chưa được xác thực
    // - Kiểm tra ngay sau khi mật khẩu khớp để tránh user enumeration qua timing.
    if (user && !user.isVerified) {
      // (Không tăng failed attempts ở đây vì mật khẩu đã đúng; chỉ chặn truy cập do chưa verify)
      console.warn(`[auth] login blocked - email not verified: ${user.email}`);
      return res
        .status(403)
        .json({ error: "Email chưa được xác thực. Vui lòng kiểm tra email." });
    }

    // Nếu tài khoản bị khóa -> trả 423
    if (user.isAccountLocked && user.isAccountLocked()) {
      console.warn(`[auth] login attempt while locked for user=${user.email}`);
      return res
        .status(423)
        .json({
          error:
            "Tài khoản đang tạm khóa do nhiều lần đăng nhập thất bại. Vui lòng thử lại sau.",
        });
    }

    // Reset counters sau khi đăng nhập thành công
    await user
      .resetFailedLogins()
      .catch((e) => console.warn("resetFailedLogins failed", e));

    // Tạo access + refresh token, lưu hash refresh, set cookie...
    const accessToken = signAccessToken(user);
    const { plain: refreshPlain, hash: refreshHash } = createRefreshToken();
    const refreshExpires = new Date(
      Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000
    );

    // lưu hash và expiry vào user
    user.refreshTokenHash = refreshHash;
    user.refreshTokenExpires = refreshExpires;
    await user.save();

    // set httpOnly cookie cho refresh token
    const cookieOptions = {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "lax",
      maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
      path: "/",
    };
    res.cookie("refreshToken", refreshPlain, cookieOptions);

    // trả access token + user sanitized
    return res
      .status(200)
      .json({ message: "Login success", accessToken, user: user.toJSON() });
  } catch (err) {
    console.error("login error", err);
    return res.status(500).json({ error: "Login failed" });
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
    const { token, id } = req.validatedBody || req.body;
    if (!token || !id)
      return res.status(400).json({ error: "token và id là bắt buộc" });

    const user = await User.findById(String(id)).exec();
    if (!user) {
      // Trả 400 để rõ lỗi; nếu muốn ẩn existence, trả 200 generic
      return res.status(400).json({ error: "Người dùng không tồn tại" });
    }

    if (user.isVerified) {
      return res.status(200).json({ message: "Email đã được xác thực" });
    }

    if (!user.emailVerifyToken || !user.emailVerifyExpires) {
      return res.status(400).json({
        error: "Không có token xác thực hợp lệ. Vui lòng yêu cầu gửi lại.",
      });
    }

    // hash token gửi lên và so sánh
    const tokenHash = crypto
      .createHash("sha256")
      .update(String(token))
      .digest("hex");
    if (tokenHash !== user.emailVerifyToken) {
      return res.status(400).json({ error: "Token không hợp lệ" });
    }

    // kiểm tra expiry
    if (user.emailVerifyExpires.getTime() < Date.now()) {
      return res
        .status(400)
        .json({ error: "Token đã hết hạn. Vui lòng yêu cầu gửi lại." });
    }

    // hợp lệ -> xác thực tài khoản
    user.isVerified = true;
    user.emailVerifyToken = null;
    user.emailVerifyExpires = null;
    user.emailVerifySentAt = null;
    await user.save();

    return res.status(200).json({ message: "Xác thực email thành công" });
  } catch (err) {
    console.error("verifyEmail error", err);
    return res.status(500).json({ error: "Xác thực thất bại" });
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
    const { name, email, password } = req.validatedBody || req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "name, email, password required" });
    if (password.length < 8)
      return res.status(400).json({ error: "password min 8 chars" });

    const normalizedEmail = String(email).trim().toLowerCase();

    // check existing
    const exists = await User.findOne({ email: normalizedEmail }).lean().exec();
    if (exists)
      return res.status(409).json({ error: "Email already registered" });

    // NOTE: Bỏ việc hash password ở controller để tránh double-hash.
    // Việc hash sẽ do UserSchema.pre('save') xử lý trong models/users.js
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password, // để plain — model sẽ hash trước khi lưu
      isVerified: false,
    });

    // create email verification token (store hashed token)
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    // store on user (ensure fields exist in User model)
    user.emailVerifyToken = tokenHash;
    user.emailVerifyExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h
    await user.save();

    // send verification email asynchronously (implement sendVerificationEmail)
    sendVerificationEmail(user.email, { token, userId: user._id }).catch(
      (err) => console.error("send email failed", err)
    );

    return res
      .status(201)
      .json({ message: "Registered. Check your email to verify." });
  } catch (err) {
    // handle duplicate key race (in case unique index triggered)
    if (err?.code === 11000)
      return res.status(409).json({ error: "Email already registered" });
    console.error("register error", err);
    return res.status(500).json({ error: "Registration failed" });
  }
}
