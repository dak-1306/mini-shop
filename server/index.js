// server/index.js
import express from "express";
import axios from "axios";
import rateLimit from "express-rate-limit";
import apicache from "apicache";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; // added

dotenv.config();

const PORT = process.env.PORT || 4000;
const API_BASE = process.env.THIRD_PARTY_API || "https://dummyjson.com";

// cookie settings for auth route
const COOKIE_NAME = process.env.COOKIE_NAME || "app_token";
const COOKIE_SECURE = process.env.COOKIE_SECURE === "true" || false;
const COOKIE_SAMESITE = process.env.COOKIE_SAMESITE || "lax";
const COOKIE_MAX_AGE = Number(process.env.COOKIE_MAX_AGE) || 1000 * 60 * 30; // 30m

const app = express();
app.use(express.json());
// enable CORS with credentials support
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser()); // so we can read cookies if needed later
app.use(helmet());
app.use(compression());
app.use(morgan("tiny"));

// rate limit: 100 req per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// cache middleware
const cache = apicache.middleware;

// Example: GET /api/products -> relay to https://dummyjson.com/products
app.get("/api/products", cache("2 minutes"), async (req, res) => {
  try {
    // forward query params like ?limit=10&skip=0
    const query = new URLSearchParams(req.query).toString();
    const url = `${API_BASE}/products${query ? "?" + query : ""}`;
    const response = await axios.get(url, {
      headers: {
        // if you have API key, attach here
        // Authorization: `Bearer ${process.env.THIRD_PARTY_KEY}`
      },
      timeout: 8000,
    });
    return res.json(response.data);
  } catch (err) {
    console.error("relay error", err?.message || err);
    return res.status(502).json({ error: "Bad gateway" });
  }
});

// NEW: POST /api/auth/login -> relay to third-party auth and set httpOnly cookie if token present
app.post("/api/auth/login", async (req, res) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, req.body, {
      headers: { "Content-Type": "application/json" },
      timeout: 8000,
    });

    const data = response.data;
    const token = data?.token ?? data?.accessToken ?? null;

    if (token) {
      // set httpOnly cookie for client
      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: COOKIE_SECURE,
        sameSite: COOKIE_SAMESITE,
        maxAge: COOKIE_MAX_AGE,
      });
    }

    // forward upstream response body to client
    return res.status(response.status).json(data);
  } catch (err) {
    console.error("auth relay error", err?.message || err);
    if (err.response) {
      // forward upstream error status/body
      return res.status(err.response.status).json(err.response.data);
    }
    return res.status(502).json({ error: "Bad gateway" });
  }
});

// Example: POST checkout -> forward to create order endpoint (or mock)
app.post("/api/checkout", async (req, res) => {
  try {
    // validate body minimal
    const { items, address } = req.body;
    if (!items || !Array.isArray(items))
      return res.status(400).json({ error: "items required" });

    // forward to third-party or handle locally
    const response = await axios.post(
      `${API_BASE}/carts/add`,
      {
        /* adapt to API */
      },
      { timeout: 8000 }
    );
    return res.json({ ok: true, source: response.data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "checkout failed" });
  }
});

// forward GET /api/products/search
app.get("/api/products/search", async (req, res) => {
  try {
    const query = new URLSearchParams(req.query).toString();
    const url = `${API_BASE}/products/search${query ? "?" + query : ""}`;
    const response = await axios.get(url, { timeout: 8000 });
    return res.json(response.data);
  } catch (err) {
    if (err.response)
      return res.status(err.response.status).json(err.response.data);
    return res.status(502).json({ error: "Bad gateway" });
  }
});

// forward GET /api/products/:id
app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(
      `${API_BASE}/products/${encodeURIComponent(id)}`,
      { timeout: 8000 }
    );
    return res.json(response.data);
  } catch (err) {
    if (err.response)
      return res.status(err.response.status).json(err.response.data);
    return res.status(502).json({ error: "Bad gateway" });
  }
});

// forward GET /api/products/categories -> trả về array of { slug, name, url }
app.get("/api/products/categories", async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE}/products/categories`, {
      timeout: 8000,
    });
    const slugs = Array.isArray(response.data) ? response.data : [];

    const mapped = slugs.map((slug) => ({
      slug,
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      url: `${API_BASE}/products/category/${encodeURIComponent(slug)}`,
    }));

    return res.json(mapped);
  } catch (err) {
    console.error("categories relay error", err?.message || err);
    if (err.response)
      return res.status(err.response.status).json(err.response.data);
    return res.status(502).json({ error: "Bad gateway" });
  }
});

app.listen(PORT, () => {
  console.log("Relay server running on port", PORT);
});
