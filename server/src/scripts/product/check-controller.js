/**
 * Kiểm tra product.controller.listProducts và getProduct với mongodb-memory-server
 * Chạy:
 *   cd E:\React\mini-shop\server
 *   node .\src\scripts\product\check-controller.js
 */
import { MongoMemoryServer } from "mongodb-memory-server";
import assert from "assert";

(async () => {
  let mongod;
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGO_URI = uri;
    process.env.NODE_ENV = "test";

    const { connectDB, disconnectDB } = await import("../../config/db.js");
    const Product = (await import("../../models/products.js")).default;
    const Category = (await import("../../models/categories.js")).default;
    const { listProducts, getProduct } = await import(
      "../../controller/product.controller.js"
    );

    await connectDB();

    // Tạo category (product.schema yêu cầu category)
    const cat = await Category.create({
      name: "CheckCat",
      description: "cat for tests",
      slug: "checkcat",
    });

    // Seed products
    const seed = [
      { title: "P A", description: "desc A", price: 1.1, category: cat._id },
      { title: "P B", description: "desc B", price: 2.2, category: cat._id },
      { title: "P C", description: "desc C", price: 3.3, category: cat._id },
    ];
    const created = await Product.create(seed);

    // Mock res for listProducts
    let statusList = null,
      bodyList = null;
    const resList = {
      status(code) {
        statusList = code;
        return this;
      },
      json(obj) {
        bodyList = obj;
        return this;
      },
    };
    const reqList = { query: { page: 1, limit: 10 } };

    await listProducts(reqList, resList);

    console.log("listProducts -> status:", statusList);
    console.log("listProducts -> meta:", bodyList?.meta);
    console.log(
      "listProducts -> items.length:",
      Array.isArray(bodyList?.items) ? bodyList.items.length : "no items"
    );

    assert(statusList === 200, "listProducts did not return 200");
    assert(
      Array.isArray(bodyList.items) && bodyList.items.length >= 3,
      "listProducts items count mismatch"
    );

    // Test getProduct for first created product
    const firstId = String(created[0]._id);
    let statusGet = null,
      bodyGet = null;
    const resGet = {
      status(code) {
        statusGet = code;
        return this;
      },
      json(obj) {
        bodyGet = obj;
        return this;
      },
    };
    const reqGet = { params: { id: firstId } };

    await getProduct(reqGet, resGet);

    console.log("getProduct -> status:", statusGet);
    console.log("getProduct -> product._id:", bodyGet?.product?._id);

    assert(statusGet === 200, "getProduct did not return 200");
    assert(
      String(bodyGet.product._id) === firstId,
      "getProduct returned wrong product id"
    );

    console.log("CHECK PASSED: controller đọc Product đúng.");

    await disconnectDB();
    await mongod.stop();
    process.exit(0);
  } catch (err) {
    console.error("CHECK FAILED:", err);
    try {
      if (mongod) await mongod.stop();
    } catch (e) {}
    process.exit(1);
  }
})();
