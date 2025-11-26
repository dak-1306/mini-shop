import { connectDB, disconnectDB } from "../config/db.js";
import Product from "../models/products.js";
import { THIRD_PARTY_API } from "../config/env.js";

/**
 * Simple importer: fetch products from THIRD_PARTY_API and upsert by externalId.
 * - Assumes THIRD_PARTY_API returns JSON with { products: [...] } or an array.
 * - Map fields as needed for your schema.
 */

async function upsertProductFromYummy(p) {
  const filter = { externalId: p.id };
  const doc = {
    title: p.title ?? p.name ?? "",
    description: p.description ?? p.summary ?? "",
    shortDescription: p.shortDescription ?? "",
    price: p.price ?? 0,
    discountPercentage: p.discountPercentage ?? 0,
    images: Array.isArray(p.images) ? p.images : p.images ? [p.images] : [],
    thumbnail: p.thumbnail ?? (Array.isArray(p.images) ? p.images[0] : ""),
    rating: p.rating ?? 0,
    stock: p.stock ?? 0,
    brand: p.brand ?? "",
    tags: Array.isArray(p.tags) ? p.tags : [],
    isDeleted: false,
  };

  return Product.findOneAndUpdate(
    filter,
    { $set: doc, $setOnInsert: { externalId: p.id } },
    { upsert: true, new: true, runValidators: true }
  ).exec();
}

async function fetchProducts() {
  if (!THIRD_PARTY_API) {
    throw new Error("THIRD_PARTY_API not configured in env");
  }
  const url = `${THIRD_PARTY_API.replace(/\/$/, "")}/products`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.products ?? [];
}

async function main() {
  try {
    await connectDB();
    await Product.init(); // ensure indexes (incl. externalId) created

    const items = await fetchProducts();
    console.log(`Fetched ${items.length} products from yummy`);

    let i = 0;
    for (const p of items) {
      const r = await upsertProductFromYummy(p);
      i++;
      if (i % 20 === 0) console.log(`Upserted ${i}/${items.length}`);
    }
    console.log(`Upsert completed: ${i} products`);
  } catch (err) {
    console.error("Import failed:", err);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1].endsWith("import-from-yummy.js")
) {
  main();
}

export { upsertProductFromYummy, fetchProducts };
