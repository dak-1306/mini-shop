/**
 * Controller cho Category
 * - Vị trí: server/src/controller/category.controller.js
 * - Chức năng cơ bản:
 *    + createCategory
 *    + getCategory
 *    + listCategories
 *    + updateCategory
 *    + deleteCategory (soft delete / hard delete tùy yêu cầu)
 *
 * Ghi chú:
 * - Dùng req.validatedBody nếu có middleware validation; fallback req.body.
 * - Trả JSON với mã HTTP chuẩn. Mongoose model Category ở src/models/categories.js.
 */
import mongoose from "mongoose";
import Category from "../models/categories.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

export async function createCategory(req, res) {
  try {
    const payload = req.validatedBody || req.body;
    if (!payload || !payload.name)
      return res.status(400).json({ error: "Missing category name" });

    const cat = await Category.create(payload);
    return res.status(201).json({ message: "Category created", category: cat });
  } catch (err) {
    console.error("createCategory error", err);
    // handle duplicate key (unique name/slug)
    if (err?.code === 11000)
      return res.status(409).json({ error: "Category already exists" });
    return res.status(500).json({ error: "Create category failed" });
  }
}

export async function getCategory(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid category id" });

    const category = await Category.findById(id).lean().exec();
    if (!category) return res.status(404).json({ error: "Category not found" });

    return res.status(200).json({ category });
  } catch (err) {
    console.error("getCategory error", err);
    return res.status(500).json({ error: "Get category failed" });
  }
}

export async function listCategories(req, res) {
  try {
    const {
      page = DEFAULT_PAGE,
      limit = DEFAULT_LIMIT,
      q,
      isActive,
    } = req.query;
    const pg = Math.max(1, Number(page) || DEFAULT_PAGE);
    const lim = Math.max(1, Math.min(200, Number(limit) || DEFAULT_LIMIT));

    const filter = {};
    if (typeof isActive !== "undefined")
      filter.isActive = String(isActive) === "true";
    if (q) filter.$text = { $search: String(q) };

    const skip = (pg - 1) * lim;
    const [items, total] = await Promise.all([
      Category.find(filter)
        .sort({ priority: -1, name: 1 })
        .skip(skip)
        .limit(lim)
        .lean()
        .exec(),
      Category.countDocuments(filter).exec(),
    ]);

    return res.status(200).json({
      meta: {
        page: pg,
        limit: lim,
        total,
        totalPages: Math.ceil(total / lim) || 1,
      },
      items,
    });
  } catch (err) {
    console.error("listCategories error", err);
    return res.status(500).json({ error: "List categories failed" });
  }
}

export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid category id" });

    const payload = req.validatedBody || req.body;
    if (!payload) return res.status(400).json({ error: "Missing update data" });

    const updated = await Category.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).exec();
    if (!updated) return res.status(404).json({ error: "Category not found" });

    return res
      .status(200)
      .json({ message: "Category updated", category: updated });
  } catch (err) {
    console.error("updateCategory error", err);
    if (err?.code === 11000)
      return res.status(409).json({ error: "Duplicate category/slug" });
    return res.status(500).json({ error: "Update category failed" });
  }
}

export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid category id" });

    // hiện thực: xóa cứng. Nếu muốn soft-delete, thêm field isDeleted và set = true.
    const removed = await Category.findByIdAndDelete(id).exec();
    if (!removed) return res.status(404).json({ error: "Category not found" });

    return res.status(200).json({ message: "Category deleted" });
  } catch (err) {
    console.error("deleteCategory error", err);
    return res.status(500).json({ error: "Delete category failed" });
  }
}

export default {
  createCategory,
  getCategory,
  listCategories,
  updateCategory,
  deleteCategory,
};
