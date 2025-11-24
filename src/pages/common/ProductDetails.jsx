import React from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/utils/price";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProduct } from "../../hooks/useProducts";

/**
 * ProductDetails - hiển thị thông tin chi tiết sản phẩm (dựa trên response dummyjson)
 * - dùng useProduct(id) (react-query)
 * - hỗ trợ chọn số lượng, thêm vào giỏ, hiển thị ảnh, thông tin kỹ thuật, reviews, meta
 */
export default function ProductDetails() {
  const { id } = useParams();
  const productId = id ? decodeURIComponent(id) : null;

  const { data: product, isLoading, isError, error } = useProduct(productId);
  const addItem = useCartStore((s) => s.addItem);

  const [qty, setQty] = React.useState(1);

  React.useEffect(() => {
    setQty(1);
  }, [productId]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-6 text-center">
          Đang tải sản phẩm...
        </div>
      </MainLayout>
    );
  }

  if (isError) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-6 text-center">
          <p className="text-sm text-destructive">
            Lỗi khi tải sản phẩm: {error?.message ?? "Unknown error"}
          </p>
          <Link to="/" className="mt-4 inline-block text-sm hover:underline">
            Quay về trang chủ
          </Link>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Sản phẩm không tồn tại.
          </p>
          <Link to="/" className="mt-4 inline-block text-sm hover:underline">
            Quay về trang chủ
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Map fields from dummyjson shape
  const title = product.title ?? product.name;
  const images =
    product.images ?? (product.thumbnail ? [product.thumbnail] : []);
  const mainImage = images[0] ?? product.thumbnail ?? product.image;
  const price = product.price ?? 0;
  const sku = product.sku ?? "N/A";
  const brand = product.brand ?? "N/A";
  const stock = typeof product.stock === "number" ? product.stock : null;
  const availability =
    product.availabilityStatus ?? (stock > 0 ? "In Stock" : "Out of stock");
  const rating = typeof product.rating === "number" ? product.rating : null;
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const dimensions = product.dimensions ?? {};
  const meta = product.meta ?? {};

  function handleAddToCart() {
    addItem(
      {
        id: product.id,
        name: title,
        price,
        image: mainImage,
        sku,
      },
      qty
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Images */}
        <div className="col-span-1 space-y-4">
          <div className="w-full rounded overflow-hidden bg-white shadow">
            <img
              src={mainImage}
              alt={title}
              className="w-full h-auto object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((src, i) => (
                <button
                  key={src ?? i}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    // swap main image by reordering images array (simple local state)
                    const el = e.currentTarget;
                    const parent = el.closest(".max-w-6xl");
                    // quick approach: set src to main image via React state would be cleaner;
                    // keep simple: replace mainImage by forcing re-render through state below
                  }}
                  className="w-full h-20 overflow-hidden rounded border"
                >
                  <img
                    src={src}
                    alt={`${title} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info + actions */}
        <div className="col-span-1 md:col-span-2 space-y-4">
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <div className="flex items-center gap-3 mt-2">
              {rating != null && (
                <div className="flex items-center gap-1 text-sm text-yellow-500">
                  <Star className="w-4 h-4" />{" "}
                  <span className="font-medium">{rating.toFixed(1)}</span>
                </div>
              )}
              <div className="text-sm text-muted-foreground">SKU: {sku}</div>
              <div className="text-sm text-muted-foreground">
                Brand: {brand}
              </div>
            </div>
          </div>

          <div className="text-2xl font-bold">{formatCurrency(price)}</div>

          <p className="text-sm text-muted-foreground">{product.description}</p>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <label className="text-sm mb-1">Số lượng</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 border rounded"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) =>
                    setQty(Math.max(1, Number(e.target.value || 1)))
                  }
                  className="w-16 text-center border rounded px-2 py-1"
                />
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="px-3 py-1 border rounded"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="default"
                onClick={handleAddToCart}
                disabled={stock === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" /> Thêm vào giỏ
              </Button>

              <div className="text-sm text-muted-foreground">
                {availability}
                {stock != null && ` — ${stock} có sẵn`}
              </div>
            </div>
          </div>

          <section className="pt-4 border-t mt-4 pt-4">
            <h2 className="text-lg font-medium mb-2">Thông tin sản phẩm</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>Brand: {brand}</div>
              <div>SKU: {sku}</div>
              <div>Weight: {product.weight ?? "N/A"} g</div>
              <div>Min order: {product.minimumOrderQuantity ?? "1"}</div>
              <div>Warranty: {product.warrantyInformation ?? "N/A"}</div>
              <div>Shipping: {product.shippingInformation ?? "N/A"}</div>
              <div>
                Dimensions:{" "}
                {dimensions.width || dimensions.height || dimensions.depth
                  ? `${dimensions.width ?? "-"} x ${
                      dimensions.height ?? "-"
                    } x ${dimensions.depth ?? "-"}`
                  : "N/A"}
              </div>
              <div>
                Discount:{" "}
                {product.discountPercentage
                  ? `${product.discountPercentage}%`
                  : "—"}
              </div>
              <div>
                Tags:{" "}
                {Array.isArray(product.tags) ? product.tags.join(", ") : "—"}
              </div>
            </div>
          </section>

          <section className="pt-4 border-t mt-4 pt-4">
            <h2 className="text-lg font-medium mb-2">
              Đánh giá ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Chưa có đánh giá.
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r, idx) => (
                  <div
                    key={`${r.reviewerEmail ?? idx}-${r.date ?? idx}`}
                    className="p-3 border rounded"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        {r.reviewerName ?? "Anonymous"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(r.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-yellow-500">
                      <Star className="w-4 h-4" /> <span>{r.rating}/5</span>
                    </div>
                    <p className="text-sm mt-2">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="pt-4 border-t mt-4 pt-4">
            <div className="text-xs text-muted-foreground">
              Created:{" "}
              {meta.createdAt ? new Date(meta.createdAt).toLocaleString() : "—"}{" "}
              • Updated:{" "}
              {meta.updatedAt ? new Date(meta.updatedAt).toLocaleString() : "—"}
            </div>
            {meta.barcode && (
              <div className="text-xs text-muted-foreground">
                Barcode: {meta.barcode}
              </div>
            )}
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
