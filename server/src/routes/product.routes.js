/**
 * Routes cho Product
 * - Base: /api/products
 * - Các route cơ bản: POST /, GET /:id, GET /, PUT /:id, DELETE /:id
 *
 * Ghi chú:
 * - Bạn có thể thêm middleware authenticate/authorize nếu cần (chỉ owner/admin được create/update/delete).
 * - Hiện file chỉ mount controller trực tiếp, không validate đầu vào để giữ ví dụ ngắn gọn.
 */
import express from "express";
import {
  createProduct,
  getProduct,
  listProducts,
  searchProducts,
  getProductsByCategorySlug,
  updateProduct,
  deleteProduct,
} from "../controller/product.controller.js";

const router = express.Router();

// POST /api/products
router.post("/", createProduct);

// GET /api/products => list (hỗ trợ page/limit hoặc skip/limit)
router.get("/", listProducts);

// search / by category slug (must come before /:id route)
router.get("/search", searchProducts);

router.get("/category/:slug", getProductsByCategorySlug);

// GET /api/products/:id => chi tiết (must come last)
router.get("/:id", getProduct);

// PUT /api/products/:id => cập nhật
router.put("/:id", updateProduct);

// DELETE /api/products/:id => xoá mềm
router.delete("/:id", deleteProduct);

export default router;
