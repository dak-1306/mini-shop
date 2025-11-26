import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { PORT } from "./config/env.js";

const port = Number(PORT) || Number(process.env.PORT) || 4000;

let server;

/**
 * Start server:
 * - Kết nối DB trước khi listen.
 * - Nếu connect DB thất bại, exit(1).
 */
async function start() {
  try {
    await connectDB();
    server = app.listen(port, () => {
      console.log(
        `Server listening on http://localhost:${port} (env=${
          process.env.NODE_ENV || "development"
        })`
      );
    });
  } catch (err) {
    console.error("Failed to start:", err?.message || err);
    process.exit(1);
  }
}

/**
 * Graceful shutdown:
 * - Close http server và disconnect mongoose.
 */
async function shutdown(signal) {
  try {
    console.log(`Received ${signal} - closing server`);
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await disconnectDB();
    console.log("Shutdown complete");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
}

// global error handlers
process.on("unhandledRejection", (reason) => {
  console.error("unhandledRejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("uncaughtException:", err);
  // optional: attempt graceful shutdown
  shutdown("uncaughtException");
});

// handle termination signals
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// run
start();
