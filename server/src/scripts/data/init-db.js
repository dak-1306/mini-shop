import { connectDB, disconnectDB } from "../../config/db.js";
import Product from "../../models/products.js";
import User from "../../models/users.js";
import Cart from "../../models/cart.js";
import Wishlist from "../../models/wishlists.js";
import Review from "../../models/reviews.js";
import Order from "../../models/orders.js";

// script để khởi tạo cơ sở dữ liệu, tạo các chỉ mục cần thiết

async function main() {
  try {
    await connectDB();
    // ensure indexes / create collections
    await Promise.all([
      Product.init(),
      User.init(),
      Cart.init(),
      Wishlist.init(),
      Review.init(),
      Order.init(),
    ]);
    console.log(
      "Models initialized and indexes created (collections will appear if needed)"
    );
  } catch (err) {
    console.error("Init DB error:", err);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

main();
