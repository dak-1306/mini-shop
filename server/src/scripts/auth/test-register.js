/**
 * Test tích hợp cho register endpoint (controller.register)
 * - Dùng mongodb-memory-server để không ảnh hưởng DB thật
 * - Kiểm tra các điều sau:
 *    1) User được tạo trong DB
 *    2) password đã được hash (có giá trị trong saved.password)
 *    3) isVerified = false (mặc định)
 *    4) emailVerifyToken (hash) và emailVerifyExpires được lưu
 *
 * Cách chạy:
 *   cd E:\React\mini-shop\server
 *   node .\src\scripts\auth\test-register.js
 *
 * Ghi chú:
 * - Script set process.env.MONGO_URI trước khi import connectDB để connect tới in-memory mongo.
 * - Controller sử dụng req.validatedBody nếu có middleware validate; test cung cấp cả req.body và req.validatedBody.
 */

(async function main() {
  try {
    // tạo mongodb-memory-server
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // đảm bảo sử dụng in-memory DB cho toàn bộ module import sau
    process.env.MONGO_URI = uri;
    process.env.NODE_ENV = "test";

    // import connect/disconnect sau khi đã set MONGO_URI
    const { connectDB, disconnectDB } = await import("../../config/db.js");
    const User = (await import("../../models/users.js")).default;
    const { register } = await import("../../controller/auth.controller.js");

    // connect tới in-memory mongo
    await connectDB();

    // dữ liệu test
    const testEmail = `testuser_${Date.now()}@example.com`;
    const body = {
      name: "Test User",
      email: testEmail,
      password: "Password123!",
    };

    // cung cấp cả req.body và req.validatedBody để tương thích với middleware validate
    const req = { body, validatedBody: body };

    let resStatus = null;
    let resBody = null;
    const res = {
      status(code) {
        resStatus = code;
        return this;
      },
      json(obj) {
        resBody = obj;
        console.log("Response:", resStatus, JSON.stringify(obj));
        return this;
      },
    };

    // gọi controller register
    await register(req, res);

    // kiểm tra DB
    const saved = await User.findOne({ email: testEmail }).lean().exec();

    if (!saved) {
      console.error("TEST FAILED: user not created in DB");
      process.exitCode = 1;
    } else {
      console.log("User record from DB:", {
        id: saved._id.toString(),
        email: saved.email,
        // password đã hash (kiểm tra tồn tại chuỗi)
        hasPassword: !!saved.password,
        // isVerified phải là false theo thiết kế
        isVerified: !!saved.isVerified,
        // token hash & expiry phải tồn tại
        emailVerifyTokenExists: !!saved.emailVerifyToken,
        emailVerifyExpiresExists: !!saved.emailVerifyExpires,
      });

      // assert cơ bản (không dùng framework test để giữ file đơn giản)
      let ok = true;
      if (!saved.password) {
        console.error("ASSERT FAILED: password not stored/hashed");
        ok = false;
      }
      if (saved.isVerified) {
        console.error(
          "ASSERT FAILED: isVerified should be false after register"
        );
        ok = false;
      }
      if (!saved.emailVerifyToken) {
        console.error("ASSERT FAILED: emailVerifyToken missing");
        ok = false;
      }
      if (!saved.emailVerifyExpires) {
        console.error("ASSERT FAILED: emailVerifyExpires missing");
        ok = false;
      }

      if (ok) {
        console.log("TEST PASSED");
      } else {
        console.error("TEST FAILED: one or more assertions failed");
        process.exitCode = 1;
      }
    }

    // cleanup
    await disconnectDB();
    await mongod.stop();
  } catch (err) {
    console.error("TEST ERROR:", err);
    process.exitCode = 1;
  }
})();
