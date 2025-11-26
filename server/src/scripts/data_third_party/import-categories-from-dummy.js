import { connectDB, disconnectDB } from "../../config/db.js";
import Category from "../../models/categories.js";
import { THIRD_PARTY_API } from "../../config/env.js";

/**
 * Importer categories from THIRD_PARTY_API
 * - Supports API returning array of strings or array of objects.
 * - For objects expects possible fields: { id, name, parentId, slug, meta }
 * - Upsert by externalId (if provided). Uses sparse unique index on externalId.
 */

async function fetchCategories() {
  if (!THIRD_PARTY_API) {
    throw new Error("THIRD_PARTY_API not configured in env");
  }
  const url = `${THIRD_PARTY_API.replace(/\/$/, "")}/products/categories`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  const data = await res.json();
  // support both shape: array or { categories: [...] }
  return Array.isArray(data) ? data : data.categories ?? [];
}

async function upsertCategoryItem(item) {
  // Normalize into object { externalId?, name, slug?, meta? }
  let payload;
  if (typeof item === "string") {
    payload = { name: item };
  } else {
    payload = {
      externalId: typeof item.id !== "undefined" ? item.id : undefined,
      name: item.name ?? item.title ?? "",
      slug: item.slug,
      meta: item.meta ?? {},
    };
  }

  const filter =
    payload.externalId != null
      ? { externalId: payload.externalId }
      : { name: payload.name };
  const set = {
    name: payload.name,
    ...(payload.slug ? { slug: payload.slug } : {}),
    meta: payload.meta,
  };
  const opts = { upsert: true, new: true, setDefaultsOnInsert: true };
  const saved = await Category.findOneAndUpdate(
    filter,
    { $set: set, $setOnInsert: { externalId: payload.externalId } },
    opts
  ).exec();
  return { saved, source: item };
}

async function main() {
  try {
    await connectDB();
    await Category.init();

    const items = await fetchCategories();
    console.log(`Fetched ${items.length} categories from yummy`);

    // First pass: upsert all categories without parent linkage
    const results = [];
    for (const it of items) {
      const r = await upsertCategoryItem(it);
      results.push(r);
    }

    // Build map externalId -> internal _id (for items that had id)
    const map = new Map();
    for (const r of results) {
      const src = r.source;
      if (
        typeof src === "object" &&
        src !== null &&
        typeof src.id !== "undefined"
      ) {
        map.set(String(src.id), r.saved._id);
      } else if (typeof src === "string") {
        // optional: map by name if needed
        map.set(String(src), r.saved._id);
      }
    }

    // Second pass: if items have parentId, update parentId using map
    let updatedCount = 0;
    for (const r of results) {
      const src = r.source;
      if (
        typeof src === "object" &&
        src !== null &&
        typeof src.parentId !== "undefined" &&
        src.parentId != null
      ) {
        const parentInternal = map.get(String(src.parentId));
        if (parentInternal) {
          // update the category document's parentId
          await Category.findByIdAndUpdate(r.saved._id, {
            parentId: parentInternal,
          }).exec();
          updatedCount++;
        }
      }
    }

    console.log(
      `Upsert completed: ${results.length} categories (${updatedCount} parent links updated)`
    );
  } catch (err) {
    console.error("Import categories failed:", err);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

// run when executed directly
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1].endsWith("import-categories-from-dummy.js")
) {
  main();
}

export { fetchCategories, upsertCategoryItem };
