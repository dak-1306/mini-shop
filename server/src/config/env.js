import dotenv from "dotenv";
dotenv.config();

const toBool = (v, d = false) =>
  typeof v === "undefined" ? d : String(v).toLowerCase() === "true";
const toNum = (v, d = 0) => {
  const n = Number(v);
  return Number.isNaN(n) ? d : n;
};

export const NODE_ENV = process.env.NODE_ENV || "development";
export const IS_PROD = NODE_ENV === "production";

export const PORT = toNum(process.env.PORT, 4000);
export const CLIENT_ORIGIN =
  process.env.CLIENT_ORIGIN || "http://localhost:5173";

export const THIRD_PARTY_API = process.env.THIRD_PARTY_API || "";
export const PRODUCTS_FROM_THIRD_PARTY = toBool(
  process.env.PRODUCTS_FROM_THIRD_PARTY,
  true
);

// Mongo connection string (support MONGO_URI or MONGODB_URI)
export const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "";

// Only include options supported by current mongoose driver.
// Do NOT include useNewUrlParser or useUnifiedTopology (they are defaults in mongoose v6+)
export const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: toNum(
    process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS,
    5000
  ),
  // autoIndex can be toggled for prod
  autoIndex: !IS_PROD,
};

export const JWT_SECRET = process.env.JWT_SECRET || "";
export const COOKIE_SECRET = process.env.COOKIE_SECRET || "";

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
};
