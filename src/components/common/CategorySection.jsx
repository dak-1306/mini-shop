import React from "react";
import CategoryCard from "@/components/ui/CategoryCard";
import { cn } from "@/lib/utils";

/**
 * CategorySection
 * - Props:
 *   - categories: array of { id, name, image }
 *   - onSelect: (category) => void
 *   - title: section title
 *   - className: extra wrapper classes
 */
export default function CategorySection({
  categories = [],
  onSelect,
  title = "Danh mục",
  className,
}) {
  return (
    <section
      className={cn("py-6", className)}
      aria-labelledby="categories-title"
    >
      <div className="container w-[80%] mx-auto px-4">
        <h2 id="categories-title" className="mb-4 text-lg font-semibold">
          {title}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.length === 0 ? (
            <div className="col-span-full text-sm text-muted-foreground">
              No categories
            </div>
          ) : (
            categories.map((cat) => (
              <CategoryCard
                key={cat.id ?? cat.name}
                category={cat}
                onClick={onSelect}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
