/**
 * Test tích hợp dùng routes (supertest) cho Product + Category
 * - Sử dụng mongodb-memory-server + supertest để test end-to-end qua Express routes
 * - Trình tự:
 *    1) Tạo category qua POST /api/categories
 *    2) Tạo product qua POST /api/products (gắn category._id)
 *    3) GET product detail
 *    4) GET list products
 *    5) PUT update product
 *    6) DELETE (soft delete) product
 *    7) GET product => 404
 *
 * Chạy:
 *   cd E:\React\mini-shop\server
 *   node .\src\scripts\product\test-product.js
 *
 * Ghi chú:
 * - File này gọi routes thực (thông qua app import), không gọi controller trực tiếp.
 * - Đảm bảo đã cài 'supertest' và 'mongodb-memory-server'.
 */
import { MongoMemoryServer } from "mongodb-memory-server";
import assert from "assert";

(async function main() {
  let mongod;
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // set env trước khi import connectDB/app để đảm bảo kết nối dùng in-memory mongo
    process.env.MONGO_URI = uri;
    process.env.NODE_ENV = "test";

    const { connectDB, disconnectDB } = await import("../../config/db.js");
    const appModule = await import("../../app.js");
    const app = appModule.default;

    // connect to in-memory mongo
    await connectDB();

    // import supertest dynamically
    const request = (await import("supertest")).default;

    const api = request(app);

    console.log("1) Tạo category via POST /api/categories");
    const catPayload = {
      name: "Test Category",
      description: "Category for tests",
    };
    const catRes = await api
      .post("/api/categories")
      .send(catPayload)
      .expect(201);
    const category = catRes.body?.category;
    assert(category && category._id, "Category not created");
    console.log("  -> created category id:", category._id);

    console.log("2) Tạo product via POST /api/products");
    const productPayload = {
      title: "Test Product",
      description: "Sản phẩm test",
      price: 99.99,
      tags: ["test", "sample"],
      category: category._id,
    };
    const createRes = await api
      .post("/api/products")
      .send(productPayload)
      .expect(201);
    const created = createRes.body?.product;
    assert(created && created._id, "Product not created");
    const productId = String(created._id);
    console.log("  -> created product id:", productId);

    console.log("3) GET /api/products/:id");
    const getRes = await api.get(`/api/products/${productId}`).expect(200);
    assert(
      getRes.body?.product && String(getRes.body.product._id) === productId,
      "Product detail mismatch"
    );
    console.log("  -> product detail ok");

    console.log("4) GET /api/products (list)");
    const listRes = await api
      .get("/api/products")
      .query({ page: 1, limit: 10 })
      .expect(200);
    assert(
      Array.isArray(listRes.body?.items) && listRes.body.items.length > 0,
      "List products empty"
    );
    console.log("  -> list returned", listRes.body.items.length, "items");

    console.log("5) PUT /api/products/:id (update)");
    const updatePayload = { title: "Updated Test Product", price: 79.5 };
    const updateRes = await api
      .put(`/api/products/${productId}`)
      .send(updatePayload)
      .expect(200);
    assert(
      updateRes.body?.product &&
        updateRes.body.product.title === updatePayload.title,
      "Update failed"
    );
    console.log("  -> update OK");

    console.log("6) DELETE /api/products/:id (soft delete)");
    await api.delete(`/api/products/${productId}`).expect(200);
    console.log("  -> delete OK");

    console.log("7) GET after delete => expect 404");
    await api.get(`/api/products/${productId}`).expect(404);
    console.log("  -> confirmed product not accessible after delete");

    console.log("TEST PASSED: product routes lifecycle OK");

    // cleanup
    await disconnectDB();
    await mongod.stop();
  } catch (err) {
    console.error("TEST ERROR:", err);
    if (mongod) {
      try {
        await mongod.stop();
      } catch (e) {}
    }
    process.exitCode = 1;
  }
})();
