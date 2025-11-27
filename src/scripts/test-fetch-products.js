/**
 * Test đơn giản (không dùng thư viện) để fetch products từ backend và kiểm tra shape cơ bản.
 * - Sử dụng Node (v18+) hoặc chạy trong môi trường có global fetch.
 * - Config: set env API_BASE nếu backend không chạy ở http://localhost:4000
 *
 * Chạy:
 *   cd E:\React\mini-shop\client
 *   node .\src\scripts\test-fetch-products.js
 */
(async function () {
  const API_BASE = process.env.API_BASE || "http://localhost:4000";
  const params = new URLSearchParams({ page: "1", limit: "10" });
  const url = `${API_BASE.replace(
    /\/$/,
    ""
  )}/api/products?${params.toString()}`;

  try {
    console.log("Fetching", url);
    const res = await fetch(url, { headers: { Accept: "application/json" } });

    if (!res.ok) {
      console.error("FAIL - HTTP status", res.status, await res.text());
      process.exitCode = 1;
      return;
    }

    const body = await res.json();
    console.log("Status:", res.status);

    // Kiểm tra cơ bản về cấu trúc trả về
    if (!body || !Array.isArray(body.items)) {
      console.error(
        "FAIL - response does not contain items array:",
        JSON.stringify(body, null, 2)
      );
      process.exitCode = 1;
      return;
    }

    console.log(`OK - received ${body.items.length} product(s)`);

    // Kiểm tra shape mẫu của product đầu tiên
    const first = body.items[0];
    if (first) {
      const hasId = !!first._id;
      const hasTitle = !!(first.title || first.name);
      console.log("Sample product:", {
        id: hasId ? first._id : "(no id)",
        title: hasTitle ? first.title || first.name : "(no title)",
      });

      if (!hasId || !hasTitle) {
        console.warn("WARN - sample product missing expected fields");
      }
    }

    console.log("TEST PASSED");
  } catch (err) {
    console.error("TEST ERROR:", err);
    process.exitCode = 1;
  }
})();
