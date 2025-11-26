import { connectDB, disconnectDB } from "../config/db.js";
import mongoose from "mongoose";

// script để kiểm tra kết nối cơ sở dữ liệu MongoDB

async function main() {
  try {
    const conn = await connectDB();
    console.log(
      "MongoDB connected. readyState =",
      mongoose.connection.readyState
    );
    // show current database name and collections
    const dbName = conn.connection?.name ?? conn.db?.databaseName ?? "unknown";
    console.log("DB name:", dbName);
    const cols = await conn.db.listCollections().toArray();
    console.log(
      "Collections:",
      cols.map((c) => c.name)
    );
  } catch (err) {
    console.error("MongoDB connection failed:", err.message || err);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

main();
