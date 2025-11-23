import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import ProductCard from "../../components/common/ProductCard";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/ui/pagination";
import { useProducts, useCategories } from "@/hooks/useProducts";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = (searchParams.get("query") || "").trim();
  const category = (searchParams.get("category") || "").trim(); // slug like "beauty"

  const PAGE_SIZE = 20;
  const [page, setPage] = React.useState(1);

  // reset page when search params change
  React.useEffect(() => {
    setPage(1);
  }, [query, category]);

  // server-side support: useProducts handles search AND category (calls appropriate endpoints)
  const { data, isLoading, isError, error, isFetching } = useProducts({
    page,
    limit: PAGE_SIZE,
    search: query,
    category,
  });

  const { data: categoriesData } = useCategories();
  const categories = categoriesData ?? [];

  const products = data?.products ?? [];
  const total = data?.total ?? 0;

  const heading = query
    ? `Kết quả tìm kiếm: "${query}"`
    : category
    ? `Danh mục: ${category}`
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
            <Button
              variant="outline"
              onClick={() => {
                // clear search params
                navigate("/search");
              }}
            >
              Clear
            </Button>
          </div>
        </div>
        {/* Optional: category list UI */}
        {categories.length > 0 && (
          <div className="mt-6">
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => navigate("/search")}>
                Tất cả
              </Button>

              {/*
                Fix: categories may be objects { slug, name, url }.
                Use c.slug as key and display c.name (fallback to slug).
              */}
              {categories.map((c) => {
                // normalize different shapes: string slug or object
                const slug =
                  typeof c === "string"
                    ? c
                    : c.slug ?? c?.name ?? JSON.stringify(c);
                const label = typeof c === "string" ? c : c.name ?? slug;
                return (
                  <Button
                    key={slug}
                    variant={slug === category ? "default" : "outline"}
                    onClick={() => {
                      // navigate with category slug
                      navigate(`/search?category=${encodeURIComponent(slug)}`);
                    }}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">Đang tải sản phẩm...</div>
        ) : isError ? (
          <div className="text-center py-12 text-destructive">
            Lỗi khi tải: {error?.message ?? "Unknown error"}
          </div>
        ) : products.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Không tìm thấy sản phẩm phù hợp.
          </div>
        ) : (
          <>
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

            <div className="mt-6">
              <Pagination
                page={page}
                total={total}
                pageSize={PAGE_SIZE}
                onPageChange={(p) => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setPage(p);
                }}
              />
            </div>
          </>
        )}

        {isFetching && !isLoading && (
          <div className="text-sm text-muted-foreground">Đang cập nhật...</div>
        )}
      </div>
    </MainLayout>
  );
}
