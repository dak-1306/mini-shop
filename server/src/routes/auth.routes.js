/**
 * Routes auth (đã tích hợp Joi validator)
 * - Áp registerLimiter chỉ cho route POST /register
 *
 * Ghi chú:
 * - Thứ tự middleware: limiter -> validate -> controller
 *   => giới hạn request trước khi tiêu tốn CPU/DB cho validation hoặc DB ops.
 */
import express from "express";
import {
  register,
  verifyEmail,
  resendVerify,
  login,
} from "../controller/auth.controller.js";
import validate from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerifySchema,
} from "../validators/auth.validator.js";
import { registerLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// POST /api/auth/register — áp dụng rate limiter nghiêm ngặt trước validate
router.post("/register", registerLimiter, validate(registerSchema), register);

// POST /api/auth/login — có thể áp limiter nhẹ nếu cần (không bắt buộc)
router.post("/login", validate(loginSchema), login);

// verify / resend
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);
router.post("/resend-verify", validate(resendVerifySchema), resendVerify);

export default router;
