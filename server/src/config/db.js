import mongoose from "mongoose";
import { MONGO_URI, MONGO_OPTIONS } from "./env.js";

let connected = false;

export async function connectDB() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI not set. Please define it in your .env");
  }

  if (connected || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    // defensive: remove known-unsupported legacy options if accidentally present
    const sanitized = { ...MONGO_OPTIONS };
    [
      "useNewUrlParser",
      "useUnifiedTopology",
      "useCreateIndex",
      "useFindAndModify",
      "useUnifiedTopology",
    ].forEach((k) => {
      if (k in sanitized) delete sanitized[k];
    });

    await mongoose.connect(MONGO_URI, { ...sanitized });
    connected = true;
    console.log("MongoDB connected");
    return mongoose.connection;
  } catch (err) {
    console.error("MongoDB connection error:", err.message || err);
    throw err;
  }
}

export async function disconnectDB() {
  if (!connected && mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
  connected = false;
  console.log("MongoDB disconnected");
}

export default { connectDB, disconnectDB };
