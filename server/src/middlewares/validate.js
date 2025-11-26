/**
 * Middleware validate dùng chung cho Joi schema
 * - Vị trí: server/src/middleware/validate.js
 * - Mục đích: tái sử dụng để validate req.body trước khi vào controller
 *
 * Cách dùng:
 *   import validate from "../middleware/validate.js";
 *   router.post("/register", validate(registerSchema), registerController);
 *
 * Hành vi:
 * - Nếu validation fail => trả 400 + danh sách lỗi (mỗi lỗi có message + path)
 * - Nếu pass => gán req.validatedBody = value (đã stripUnknown) và gọi next()
 *
 * Lưu ý: Joi được config với:
 * - abortEarly: false => gom hết lỗi rồi trả về
 * - stripUnknown: true => loại bỏ các trường không nằm trong schema
 */
export default function validate(schema) {
  return (req, res, next) => {
    // Dùng req.body làm nguồn dữ liệu; nếu muốn validate query/params có thể mở rộng
    const payload = req.body ?? {};

    const { error, value } = schema.validate(payload, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      // Chuẩn hoá lỗi trả về: message và path (dễ hiển thị ở frontend)
      const errors = error.details.map((d) => ({
        message: d.message,
        path: Array.isArray(d.path) ? d.path.join(".") : String(d.path),
      }));
      return res.status(400).json({ errors });
    }

    // Gán kết quả đã được sanitize/normalized để controller dùng
    req.validatedBody = value;
    return next();
  };
}
