/**
 * Controller cơ bản cho Product
 * - Vị trí: server/src/controller/product.controller.js
 * - Chức năng:
 *    + createProduct: tạo sản phẩm mới
 *    + getProduct: lấy chi tiết theo id
 *    + listProducts: danh sách (pagination, filter, search, sort)
 *    + updateProduct: cập nhật sản phẩm
 *    + deleteProduct: soft-delete (isDeleted = true)
 *
 * Ghi chú:
 * - Controller sử dụng req.validatedBody nếu có middleware validation, fallback req.body.
 * - Trả JSON với mã HTTP phù hợp và message ngắn gọn.
 * - Thực thi kiểm tra id hợp lệ bằng mongoose.Types.ObjectId.isValid.
 */

import mongoose from "mongoose";
import Product from "../models/products.js";
import Category from "../models/categories.js"; // keep for slug lookup

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

/**
 * Tạo product mới
 */
export async function createProduct(req, res) {
  try {
    const payload = req.validatedBody || req.body;
    if (!payload)
      return res.status(400).json({ error: "Missing product data" });

    const product = await Product.create(payload);
    return res.status(201).json({ message: "Product created", product });
  } catch (err) {
    console.error("createProduct error", err);
    return res.status(500).json({ error: "Create product failed" });
  }
}

/**
 * Lấy product theo id
 */
export async function getProduct(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid product id" });

    const product = await Product.findById(id).lean().exec();
    if (!product || product.isDeleted)
      return res.status(404).json({ error: "Product not found" });

    // normalize id for frontend convenience
    const norm = { ...product, id: String(product._id) };

    return res.status(200).json({ product: norm });
  } catch (err) {
    console.error("getProduct error", err);
    return res.status(500).json({ error: "Get product failed" });
  }
}

/**
 * Danh sách products (hỗ trợ cả page/limit và skip/limit)
 * - Hỗ trợ query params:
 *    page, limit           => page-based pagination (mặc định)
 *    skip, limit           => offset-based pagination (dùng nếu client gửi skip)
 *    q                     => text search
 *    category (ObjectId)   => lọc theo category id
 *    minPrice, maxPrice, tags, sort, includeDeleted
 *
 * Lưu ý:
 * - Nếu client gửi skip (số), server sẽ dùng skip thay vì page.
 */
export async function listProducts(req, res) {
  try {
    const {
      page = DEFAULT_PAGE,
      limit = DEFAULT_LIMIT,
      skip,
      q,
      category,
      minPrice,
      maxPrice,
      tags,
      sort,
      includeDeleted = "false",
    } = req.query;

    const lim = Math.max(1, Math.min(100, Number(limit) || DEFAULT_LIMIT));
    const useSkip = typeof skip !== "undefined";
    const skipVal = useSkip
      ? Math.max(0, Number(skip) || 0)
      : (Math.max(1, Number(page) || DEFAULT_PAGE) - 1) * lim;

    const filter = {};
    if (includeDeleted !== "true") filter.isDeleted = false;

    if (q) {
      filter.$text = { $search: String(q) };
    }

    if (category) {
      // nếu category là ObjectId hợp lệ thì gắn trực tiếp
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.category = category;
      } else {
        // nếu không phải ObjectId, coi đó là slug -> tìm category theo slug và lấy _id
        const catDoc = await Category.findOne({
          $or: [{ slug: String(category) }, { name: String(category) }],
        })
          .lean()
          .exec();
        if (catDoc) {
          filter.category = String(catDoc._id);
        } else {
          // không tìm thấy category theo slug/name -> đảm bảo trả rỗng
          // set filter vào một giá trị không tồn tại để kết quả rỗng
          filter.category = "_not_found_";
        }
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    if (tags) {
      const tagList = String(tags)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (tagList.length) filter.tags = { $in: tagList };
    }

    // sort parsing: e.g. "price:asc,createdAt:desc"
    let sortObj = { createdAt: -1 };
    if (sort) {
      sortObj = {};
      const parts = String(sort).split(",");
      parts.forEach((p) => {
        const [field, dir] = p.split(":").map((s) => s.trim());
        if (!field) return;
        sortObj[field] = dir === "asc" ? 1 : -1;
      });
    }

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skipVal).limit(lim).lean().exec(),
      Product.countDocuments(filter).exec(),
    ]);

    // normalize products for frontend: ensure `id` is present and _id -> string
    const products = Array.isArray(items)
      ? items.map((p) => ({ ...p, id: String(p._id) }))
      : [];

    const totalPages = lim > 0 ? Math.ceil(total / lim) : 0;
    let currentPage = useSkip
      ? Math.floor(skipVal / lim) + 1
      : Math.max(1, Number(page) || DEFAULT_PAGE);
    // clamp currentPage
    if (totalPages > 0)
      currentPage = Math.min(Math.max(1, currentPage), totalPages);

    // Return both legacy and normalized shapes:
    return res.status(200).json({
      meta: { page: currentPage, limit: lim, skip: skipVal, total, totalPages },
      items, // legacy raw items
      products, // normalized for frontend
      total,
      skip: skipVal,
      limit: lim,
      page: currentPage,
      totalPages,
    });
  } catch (err) {
    console.error("listProducts error", err);
    return res.status(500).json({ error: "List products failed" });
  }
}

/**
 * Search endpoint (alias) — frontend gọi /products/search?q=...
 * - Gọi lại listProducts logic nhưng giữ đường dẫn dễ hiểu cho frontend
 */
export async function searchProducts(req, res) {
  // reuse listProducts by delegating (set q param already present)
  return listProducts(req, res);
}

/**
 * Lấy products theo category slug
 * - Endpoint: GET /api/products/category/:slug
 * - Tìm category theo slug rồi query products theo category._id
 */
export async function getProductsByCategorySlug(req, res) {
  try {
    const { slug } = req.params;
    if (!slug) return res.status(400).json({ error: "Category slug required" });

    const category = await Category.findOne({
      $or: [
        { slug: slug },
        { slug: slug.toLowerCase() },
        { name: { $regex: new RegExp("^" + slug + "$", "i") } },
      ],
    })
      .lean()
      .exec();

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Parse query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const search = req.query.search;

    // Build filter
    let filter = {
      isDeleted: false,
      category: category._id,
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Get products
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Product.countDocuments(filter),
    ]);

    // Transform products to match frontend expectations
    const transformedProducts = products.map((product) => ({
      ...product,
      id: product._id,
    }));

    const response = {
      success: true,
      data: {
        products: transformedProducts,
        category: category,
      },
      meta: {
        page,
        limit,
        skip,
        total,
        totalPages: Math.ceil(total / limit),
      },
      // Compatibility with existing structure
      products: transformedProducts,
      items: transformedProducts,
      total,
      skip,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error("getProductsByCategorySlug error", err);
    return res
      .status(500)
      .json({ error: "Get products by category failed", details: err.message });
  }
}

/**
 * Cập nhật product
 */
export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid product id" });

    const payload = req.validatedBody || req.body;
    if (!payload) return res.status(400).json({ error: "Missing update data" });

    const updated = await Product.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).exec();

    if (!updated) return res.status(404).json({ error: "Product not found" });

    return res
      .status(200)
      .json({ message: "Product updated", product: updated });
  } catch (err) {
    console.error("updateProduct error", err);
    return res.status(500).json({ error: "Update product failed" });
  }
}

/**
 * Xoá mềm product (soft delete)
 */
export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid product id" });

    const product = await Product.findById(id).exec();
    if (!product || product.isDeleted)
      return res.status(404).json({ error: "Product not found" });

    product.isDeleted = true;
    await product.save();

    return res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    console.error("deleteProduct error", err);
    return res.status(500).json({ error: "Delete product failed" });
  }
}

/**
 * (Tùy chọn) Export default object để dễ import trong routes
 */
// Remove default export to avoid confusion
// All functions are exported individually as named exports
