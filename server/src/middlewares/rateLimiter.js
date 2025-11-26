import rateLimit from "express-rate-limit";

/**
 * registerLimiter: đã có trước (1 giờ, 5 requests)
 * loginLimiter: giới hạn cho endpoint /login (ví dụ 10 req / 15 phút)
 *
 * Lưu ý:
 * - Store mặc định là in-memory, không dùng cho multi-instance production.
 * - Ở production, dùng Redis store (ví dụ rate-limit-redis) để chia sẻ counter giữa các instance.
 */

// Giới hạn cho POST /api/auth/register
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 5, // tối đa 5 request / IP trong window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error:
      "Quá nhiều yêu cầu đăng ký từ IP này. Vui lòng thử lại sau 1 giờ hoặc liên hệ admin.",
  },
  handler: (req, res, next, options) => {
    console.warn(`[rateLimiter] Throttled ${req.ip} on ${req.originalUrl}`);
    res.status(429).json(options.message);
  },
});

// Giới hạn cho login (giảm brute-force)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 20, // tối đa 20 requests / IP / window (tùy chỉnh)
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau." },
  handler: (req, res, next, options) => {
    console.warn(
      `[rateLimiter] Login throttled ${req.ip} on ${req.originalUrl}`
    );
    res.status(429).json(options.message);
  },
});

// Ví dụ limiter chung (tùy chọn)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
