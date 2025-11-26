// Script test đơn giản cho auth.register — sử dụng mongodb-memory-server để không ảnh hưởng DB thật.
// Chạy: node src\scripts\test-register.js

(async function main() {
  try {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    process.env.MONGO_URI = uri;
    process.env.NODE_ENV = "test";

    const { connectDB, disconnectDB } = await import("../../config/db.js");
    const { default: User } = await import("../../models/users.js");
    const { register } = await import("../../controller/auth.controller.js");

    await connectDB();

    const testEmail = `testuser_${Date.now()}@example.com`;
    const body = {
      name: "Test User",
      email: testEmail,
      password: "Password123!",
    };

    // Provide both validatedBody and body so controller accepts either approach
    const req = { validatedBody: body, body };

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

    await register(req, res);

    const saved = await User.findOne({ email: testEmail }).lean().exec();
    if (!saved) {
      console.error("TEST FAILED: user not created in DB");
      process.exitCode = 1;
    } else {
      console.log("User created:", {
        id: saved._id.toString(),
        email: saved.email,
        hasPassword: !!saved.password,
        emailVerifyTokenExists: !!saved.emailVerifyToken,
      });
      console.log("TEST PASSED");
    }

    await disconnectDB();
    await mongod.stop();
  } catch (err) {
    console.error("TEST ERROR:", err);
    process.exitCode = 1;
  }
})();
