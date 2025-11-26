import dotenv from "dotenv";
/*
  Load biến môi trường từ file .env vào process.env.
  - Ở production nên dùng environment variables hoặc secrets manager.
  - dotenv.config() phù hợp cho dev; không commit secrets thật vào repository.
*/
dotenv.config();

/*
  Hàm tiện ích nhỏ để chuyển chuỗi env thành boolean/number có giá trị mặc định.
  - toBool: nếu undefined trả về giá trị default; ngược lại so sánh string.lower() === "true"
  - toNum: chuyển sang Number và trả về default nếu NaN
*/
const toBool = (v, d = false) =>
  typeof v === "undefined" ? d : String(v).toLowerCase() === "true";
const toNum = (v, d = 0) => {
  const n = Number(v);
  return Number.isNaN(n) ? d : n;
};

/*
  Các cấu hình môi trường cơ bản xuất ra để dùng trong app
*/
export const NODE_ENV = process.env.NODE_ENV || "development";
export const IS_PROD = NODE_ENV === "production";

/*
  Cấu hình server:
  - PORT: cổng numeric cho Express
  - CLIENT_ORIGIN: origin mặc định dùng cho CORS trong dev
*/
export const PORT = toNum(process.env.PORT, 4000);
export const CLIENT_ORIGIN =
  process.env.CLIENT_ORIGIN || "http://localhost:5173";

/*
  Nguồn dữ liệu bên thứ 3 (ví dụ 'dummy' API)
  - THIRD_PARTY_API: base URL của API bên thứ ba
  - PRODUCTS_FROM_THIRD_PARTY: flag bật/tắt dùng nguồn ngoài cho dữ liệu sản phẩm
*/
export const THIRD_PARTY_API = process.env.THIRD_PARTY_API || "";
export const PRODUCTS_FROM_THIRD_PARTY = toBool(
  process.env.PRODUCTS_FROM_THIRD_PARTY,
  true
);

/*
  MongoDB connection:
  - Hỗ trợ cả MONGO_URI và MONGODB_URI trong .env (fallback)
  - Không để giá trị thật trong repo; set per-environment
*/
export const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "";

/*
  MONGO_OPTIONS:
  - serverSelectionTimeoutMS: thời gian chờ driver tìm server thích hợp (ms)
  - autoIndex: Mongoose có tự build index hay không (tắt trong production để performance)
  - Lưu ý: không đưa các option legacy như useNewUrlParser/useUnifiedTopology ở đây
*/
export const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: toNum(
    process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS,
    5000
  ),
  autoIndex: !IS_PROD,
};

/*
  Secrets cho auth / cookie:
  - Giữ an toàn, không commit vào VCS
  - Ở production nên lưu bằng secret manager
*/
export const JWT_SECRET = process.env.JWT_SECRET || "";
export const COOKIE_SECRET = process.env.COOKIE_SECRET || "";

/*
  Token expiry config:
  - ACCESS_TOKEN_EXPIRES: chuỗi hỗ trợ jwt.sign expiresIn (vd: "15m", "1h")
  - REFRESH_TOKEN_EXPIRES_DAYS: số ngày refresh token có hiệu lực
  - Đặt mặc định hợp lý nếu .env không cung cấp
*/
export const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "15m";
export const REFRESH_TOKEN_EXPIRES_DAYS = toNum(
  process.env.REFRESH_TOKEN_EXPIRES_DAYS,
  30
);

/*
  Optional: thêm config liên quan login/lockout (sử dụng ở model/controller)
*/
export const BCRYPT_SALT_ROUNDS = toNum(process.env.BCRYPT_SALT_ROUNDS, 10);
export const MAX_FAILED_LOGIN_ATTEMPTS = toNum(
  process.env.MAX_FAILED_LOGIN_ATTEMPTS,
  5
);
export const ACCOUNT_LOCK_TIME_MS = toNum(
  process.env.ACCOUNT_LOCK_TIME_MS,
  30 * 60 * 1000
);

/*
  Default export cập nhật để tiện import nếu cần
*/
export default {
  NODE_ENV,
  IS_PROD,
  PORT,
  CLIENT_ORIGIN,
  THIRD_PARTY_API,
  PRODUCTS_FROM_THIRD_PARTY,
  MONGO_URI,
  MONGO_OPTIONS,
  JWT_SECRET,
  COOKIE_SECRET,
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES_DAYS,
  BCRYPT_SALT_ROUNDS,
  MAX_FAILED_LOGIN_ATTEMPTS,
  ACCOUNT_LOCK_TIME_MS,
};
