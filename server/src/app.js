import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";

/*
  Khởi tạo Express app và mount middleware + routes.
  - app chỉ chịu trách nhiệm cấu hình middleware và routes.
  - Việc start server (app.listen) nên nằm trong src/index.js hoặc file entry khác.
*/
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

app.use("/api/auth", authRoutes);

// health check
app.get("/health", (req, res) => res.json({ ok: true }));

// 404 handler
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// global error handler (simple)
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err?.status || 500)
    .json({ error: err?.message || "Internal Server Error" });
});

export default app;
