/**
 * Joi validation schemas cho các endpoint auth
 * - Vị trí: server/src/validators/auth.validator.js
 *
 * Bao gồm:
 * - registerSchema: dùng cho POST /api/auth/register
 * - loginSchema: dùng cho POST /api/auth/login
 * - verifyEmailSchema: dùng cho GET/POST /api/auth/verify-email (nếu dùng body)
 * - resendVerifySchema: dùng cho POST /api/auth/resend-verify
 *
 * Ghi chú:
 * - Các thông báo mặc định của Joi là tiếng Anh; nếu muốn hiển thị tiếng Việt
 *   chi tiết hơn có thể custom messages tại từng rule.
 * - registerSchema có hỗ trợ confirmPassword (tùy frontend gửi).
 */

import Joi from "joi";

/**
 * Schema đăng ký (register)
 * - name: tên hiển thị người dùng
 * - email: chuẩn RFC, sẽ được lowercased trong validate middleware hoặc controller
 * - password: tối thiểu 8 ký tự, tối đa 128 ký tự
 * - confirmPassword: nếu frontend bật, nên khớp với password
 */
export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    "string.base": "Tên phải là chuỗi",
    "string.empty": "Tên không được để trống",
    "string.min": "Tên phải có ít nhất {#limit} ký tự",
    "any.required": "Tên là bắt buộc",
  }),

  email: Joi.string().trim().lowercase().email().required().messages({
    "string.email": "Email không đúng định dạng",
    "string.empty": "Email không được để trống",
    "any.required": "Email là bắt buộc",
  }),

  password: Joi.string().min(8).max(128).required().messages({
    "string.min": "Mật khẩu cần ít nhất {#limit} ký tự",
    "string.empty": "Mật khẩu không được để trống",
    "any.required": "Mật khẩu là bắt buộc",
  }),

  // confirmPassword optional nhưng nếu có sẽ phải khớp password
  confirmPassword: Joi.any()
    .valid(Joi.ref("password"))
    .when("password", {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "any.only": "Mật khẩu xác nhận không khớp",
      "any.required": "Xác nhận mật khẩu là bắt buộc khi có password",
    }),
});

/**
 * Schema login
 * - Dùng cho POST /api/auth/login
 */
export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    "string.email": "Email không đúng định dạng",
    "any.required": "Email là bắt buộc",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Mật khẩu không được để trống",
    "any.required": "Mật khẩu là bắt buộc",
  }),
});

/**
 * Schema verify email (nếu bạn dùng POST body để verify)
 * - token: token plaintext gửi trong email
 * - id: id người dùng (ObjectId string)
 */
export const verifyEmailSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({ "any.required": "Token là bắt buộc" }),
  id: Joi.string()
    .required()
    .messages({ "any.required": "User id là bắt buộc" }),
});

/**
 * Schema resend verify
 * - email: địa chỉ email để gửi lại link xác thực
 */
export const resendVerifySchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    "string.email": "Email không đúng định dạng",
    "any.required": "Email là bắt buộc",
  }),
});
