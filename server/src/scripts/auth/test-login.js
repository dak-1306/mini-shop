/**
 * Test tích hợp cho login (cập nhật)
 * - Vị trí: server/src/scripts/auth/test-login.js
 * - Kiểm tra:
 *    1) login thành công với user đã verify -> trả 200 + accessToken + refresh cookie
 *    2) login thất bại khi mật khẩu sai -> trả 401
 *    3) login bị chặn khi user chưa verify -> trả 403
 *
 * Lưu ý:
 * - Sử dụng mongodb-memory-server để test độc lập.
 * - Mock res có hỗ trợ .cookie(...) vì controller sẽ gọi res.cookie()
 *
 * Chạy:
 *   cd E:\React\mini-shop\server
 *   node .\src\scripts\auth\test-login.js
 */

(async function main() {
  try {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // set env trước khi import modules phụ thuộc DB
    process.env.MONGO_URI = uri;
    process.env.NODE_ENV = "test";

    const { connectDB, disconnectDB } = await import("../../config/db.js");
    const User = (await import("../../models/users.js")).default;
    const { login } = await import("../../controller/auth.controller.js");

    await connectDB();

    // chuẩn bị data
    const verifiedEmail = `verified_${Date.now()}@example.com`;
    const unverifiedEmail = `unverified_${Date.now()}@example.com`;
    const password = "Password123!";

    // tạo user đã verify
    await User.create({
      name: "Verified",
      email: verifiedEmail,
      password,
      isVerified: true,
    });

    // tạo user chưa verify
    await User.create({
      name: "Unverified",
      email: unverifiedEmail,
      password,
      isVerified: false,
    });

    // helper gọi controller với mock res (hỗ trợ cookie)
    async function callLogin(payload) {
      const req = { validatedBody: payload, body: payload };
      let status = null;
      let body = null;
      let cookie = null;
      const res = {
        status(code) {
          status = code;
          return this;
        },
        json(obj) {
          body = obj;
          // log ngắn gọn
          // console.log("Response:", status, JSON.stringify(obj));
          return this;
        },
        cookie(name, value, opts) {
          // lưu cookie để test
          cookie = { name, value, opts };
          return this;
        },
      };
      await login(req, res);
      return { status, body, cookie };
    }

    console.log(
      "Test 1: login thành công với user đã verify (expect 200 + accessToken + cookie)"
    );
    const r1 = await callLogin({ email: verifiedEmail, password });
    if (
      r1.status === 200 &&
      r1.body?.accessToken &&
      r1.cookie?.name === "refreshToken"
    ) {
      console.log("OK - Test 1 passed");
    } else {
      console.error("FAIL - Test 1 failed", {
        status: r1.status,
        body: r1.body,
        cookie: r1.cookie,
      });
      process.exitCode = 1;
    }

    console.log("Test 2: mật khẩu sai => 401");
    const r2 = await callLogin({ email: verifiedEmail, password: "wrongpass" });
    if (r2.status === 401) {
      console.log("OK - Test 2 passed");
    } else {
      console.error("FAIL - Test 2 failed", {
        status: r2.status,
        body: r2.body,
      });
      process.exitCode = 1;
    }

    console.log("Test 3: user chưa verify => 403");
    const r3 = await callLogin({ email: unverifiedEmail, password });
    if (r3.status === 403) {
      console.log("OK - Test 3 passed");
    } else {
      console.error("FAIL - Test 3 failed", {
        status: r3.status,
        body: r3.body,
      });
      process.exitCode = 1;
    }

    // cleanup
    await disconnectDB();
    await mongod.stop();
    console.log("Tests completed");
  } catch (err) {
    console.error("TEST ERROR:", err);
    process.exitCode = 1;
  }
})();
