import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import ProductCard from "../../components/common/ProductCard";
import { mockCategories, mockProducts } from "../../data/mockData";
import { Button } from "@/components/ui/button";

import CategorySection from "../../components/common/CategorySection";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = (searchParams.get("query") || "").trim();
  const categoryId = (searchParams.get("category") || "").trim();

  function handleCategorySelect(cat) {
    // chuyển hướng tới SearchPage, truyền category id qua query string
    navigate(`/search?category=${encodeURIComponent(cat?.id ?? "")}`);
  }
  // build filtered products
  const products = React.useMemo(() => {
    let items = mockProducts;

    if (categoryId) {
      items = items.filter((p) => p.categoryId === categoryId);
    }

    if (query) {
      const q = query.toLowerCase();
      items = items.filter(
        (p) =>
          String(p.name).toLowerCase().includes(q) ||
          String(p.shortDescription || "")
            .toLowerCase()
            .includes(q)
      );
    }

    return items;
  }, [categoryId, query]);

  const category = mockCategories.find((c) => c.id === categoryId) ?? null;
  const heading = query
    ? `Kết quả tìm kiếm: "${query}"`
    : category
    ? category.name
    : "Tìm kiếm";

  return (
    <MainLayout>
      <div className="w-[80%] mx-auto space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{heading}</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="link"
              onClick={() => navigate(-1)}
              className="text-sm text-muted-foreground hover:underline"
            >
              Back
            </Button>
            <Button variant="outline" onClick={() => navigate("/search")}>
              Clear
            </Button>
          </div>
        </div>
        {products.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Không tìm thấy sản phẩm phù hợp.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                role="buyer"
                onAddToCart={(p) => console.log("Add to cart:", p)}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
