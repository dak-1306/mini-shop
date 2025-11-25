import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout.jsx";
import ProductCard from "@/components/common/ProductCard.jsx";
import CategorySection from "@/components/common/CategorySection.jsx";
import { useProducts, useCategories } from "@/hooks/useProducts.js";
import Pagination from "@/components/ui/pagination.jsx";

export default function Home() {
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);

  // gọi hook react-query -> trả về object { data, isLoading, isError, error, isFetching, ... }
  const { data, isLoading, isError, error, isFetching } = useProducts({
    page,
    limit: PAGE_SIZE,
    search: "",
  });
  // gọi thêm hook lấy categories
  const { data: categoriesData } = useCategories();
  const categories = categoriesData ?? [];

  // API dummyjson trả về object { products: [...], total, skip, limit }
  const products = data?.products ?? [];
  const total = data?.total ?? 0;
  console.log("Products:", products);

  // dùng useNavigate để chuyển hướng khi chọn category
  const navigate = useNavigate();

  function handleCategorySelect(cat) {
    navigate(`/search?category=${encodeURIComponent(cat?.id ?? "")}`);
  }

  return (
    <MainLayout>
      <CategorySection
        categories={categories}
        onSelect={handleCategorySelect}
        title="Danh mục nổi bật"
      />

      <div className="w-[80%] mx-auto space-y-8 p-4">
        {isLoading ? (
          <div className="text-center py-12">Đang tải sản phẩm...</div>
        ) : isError ? (
          <div className="text-center py-12 text-destructive">
            Lỗi khi tải: {error?.message ?? "Unknown error"}
          </div>
        ) : products.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Không có sản phẩm nào.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} role="buyer" />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6">
              <Pagination
                page={page}
                total={total}
                pageSize={PAGE_SIZE}
                onPageChange={(p) => {
                  // scroll lên đầu danh sách khi đổi trang (tuỳ chọn)
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
