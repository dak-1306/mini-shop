/**
 * Routes cho Category
 * - Base: /api/categories
 * - Vị trí: server/src/routes/category.routes.js
 *
 * Ghi chú:
 * - Không có auth middleware ở đây; nếu cần bảo vệ route thêm middleware authenticate/authorize.
 */
import express from "express";
import {
  createCategory,
  getCategory,
  listCategories,
  updateCategory,
  deleteCategory,
} from "../controller/category.controller.js";

const router = express.Router();

// POST /api/categories
router.post("/", createCategory);

// GET /api/categories => list
router.get("/", listCategories);

// GET /api/categories/:id => chi tiết
router.get("/:id", getCategory);

// PUT /api/categories/:id => update
router.put("/:id", updateCategory);

// DELETE /api/categories/:id => delete
router.delete("/:id", deleteCategory);

export default router;
