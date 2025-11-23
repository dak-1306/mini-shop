import React from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/utils/price";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProduct } from "../../hooks/useProducts";

export default function ProductDetails() {
  const { id } = useParams();
  const productId = id ? decodeURIComponent(id) : null;

  // dùng react-query hook để fetch product theo id
  const { data: product, isLoading, isError, error } = useProduct(productId);

  const addItem = useCartStore((s) => s.addItem);

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

  // dummyjson fields: title, description, price, thumbnail, images[]
  const title = product.title ?? product.name;
  const image =
    (product.images && product.images[0]) || product.thumbnail || product.image;
  const shortDesc = product.description
    ? product.description.split(".")[0]
    : "";

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-1">
          <img
            src={image}
            alt={title}
            className="w-full h-auto object-cover rounded"
          />
        </div>

        <div className="col-span-1 md:col-span-2 space-y-4">
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            {/* dummyjson không có sku mặc định */}
          </div>

          <div className="text-lg font-bold">
            {formatCurrency(product.price)}
          </div>

          <p className="text-sm text-muted-foreground">{shortDesc}</p>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              onClick={() =>
                addItem(
                  {
                    id: product.id,
                    name: title,
                    price: product.price,
                    image,
                    sku: product.sku,
                  },
                  1
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md"
            >
              <ShoppingCart className="w-4 h-4" />
              Thêm vào giỏ
            </Button>

            <Link
              to="/search"
              className="text-sm text-muted-foreground hover:underline"
            >
              Quay về tìm kiếm
            </Link>
          </div>

          <section className="pt-4">
            <h2 className="text-lg font-medium mb-2">Chi tiết</h2>
            <div className="text-sm text-muted-foreground">
              {product.description ?? "Không có mô tả chi tiết."}
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
