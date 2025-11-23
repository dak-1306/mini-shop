import React from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/utils/price";
import { ShoppingCart } from "lucide-react";
import { mockProducts } from "@/data/mockData";
import { Button } from "@/components/ui/button";

export default function ProductDetails() {
  const { id } = useParams();
  const productId = id ? decodeURIComponent(id) : null;

  const product = React.useMemo(
    () => mockProducts.find((p) => String(p.id) === String(productId)) || null,
    [productId]
  );

  const addItem = useCartStore((s) => s.addItem);

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

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-1">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-auto object-cover rounded"
          />
        </div>

        <div className="col-span-1 md:col-span-2 space-y-4">
          <div>
            <h1 className="text-2xl font-semibold">{product.name}</h1>
            <div className="text-sm text-muted-foreground">
              {product.sku ? `SKU: ${product.sku}` : null}
            </div>
          </div>

          <div className="text-lg font-bold">
            {formatCurrency(product.price)}
          </div>

          <p className="text-sm text-muted-foreground">
            {product.shortDescription}
          </p>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              onClick={() =>
                addItem(
                  {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
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
