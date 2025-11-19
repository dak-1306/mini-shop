import React from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import ProductCard from "../../components/common/ProductCard";
import CategorySection from "../../components/common/CategorySection";
import { mockCategories, mockProducts } from "../../data/mockData";

export default function Home() {
  const navigate = useNavigate();

  function handleCategorySelect(cat) {
    // chuyển hướng tới SearchPage, truyền category id qua query string
    navigate(`/search?category=${encodeURIComponent(cat?.id ?? "")}`);
  }

  return (
    <MainLayout>
      <CategorySection
        categories={mockCategories}
        onSelect={handleCategorySelect}
        title="Danh mục nổi bật"
      />

      {/* giữ phần hiển thị hiện tại nếu muốn — nhưng Home không tự lọc khi click (SearchPage xử lý) */}
      <div className="w-[80%] mx-auto space-y-8 p-4">
        {mockProducts.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Không có sản phẩm nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mockProducts.map((product) => (
              <ProductCard key={product.id} product={product} role="buyer" />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
