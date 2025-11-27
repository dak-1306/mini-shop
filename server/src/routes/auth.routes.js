/**
 * Routes auth (đã tích hợp Joi validator)
 * - Áp registerLimiter chỉ cho route POST /register
 *
 * Ghi chú:
 * - Thứ tự middleware: limiter -> validate -> controller
 *   => giới hạn request trước khi tiêu tốn CPU/DB cho validation hoặc DB ops.
 */
import express from "express";
import { register, login, logout } from "../controller/auth.controller.js";
import validate from "../middlewares/validate.js";
import { registerSchema, loginSchema } from "../middlewares/auth.validator.js";
import { registerLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Các route chính
router.post("/register", registerLimiter, validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);

export default router;
