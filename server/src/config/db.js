import mongoose from "mongoose";
import { MONGO_URI, MONGO_OPTIONS } from "./env.js";

/*
  connected flag:
  - Bộ nhớ cục bộ để tránh cố kết nối nhiều lần nếu đã có kết nối
  - Hữu ích khi chạy nhiều script trong cùng một tiến trình (dev / tests)
*/
let connected = false;

/*
  connectDB:
  - Kiểm tra MONGO_URI (ném lỗi nếu chưa cấu hình).
  - Nếu đã kết nối (theo flag hoặc mongoose.connection.readyState === 1) trả về connection hiện tại.
  - Loại bỏ các option cũ không còn hỗ trợ để tránh lỗi với mongoose/mongo driver mới.
  - Gọi mongoose.connect(...) và đặt connected = true khi thành công.
  - Ghi log lỗi ngắn gọn và rethrow để caller (script / server) xử lý.
*/
export async function connectDB() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI not set. Please define it in your .env");
  }

  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (connected || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    // Defensive: loại bỏ các tùy chọn legacy có thể gây lỗi với mongoose v6+/mongodb driver
    const sanitized = { ...MONGO_OPTIONS };
    [
      // Các option này đã được dùng ở các phiên bản cũ của Mongoose; driver hiện tại thiết lập mặc định
      "useNewUrlParser",
      "useUnifiedTopology",
      "useCreateIndex",
      "useFindAndModify",
      "useUnifiedTopology",
    ].forEach((k) => {
      if (k in sanitized) delete sanitized[k];
    });

    // connect trả về đối tượng mongoose connection
    await mongoose.connect(MONGO_URI, { ...sanitized });
    connected = true;
    console.log("MongoDB connected");
    return mongoose.connection;
  } catch (err) {
    // Ghi log lỗi ngắn gọn, rethrow để caller quyết định retry/exit
    console.error("MongoDB connection error:", err.message || err);
    throw err;
  }
}

/*
  disconnectDB:
  - Ngắt kết nối an toàn nếu đang có kết nối
  - Reset flag connected
  - Dùng để dọn dẹp trong scripts/tests
*/
export async function disconnectDB() {
  // Nếu đã disconnected thì không làm gì
  if (!connected && mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
  connected = false;
  console.log("MongoDB disconnected");
}

export default { connectDB, disconnectDB };
