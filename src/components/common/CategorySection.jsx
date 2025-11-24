import React from "react";
import CategoryCard from "@/components/ui/CategoryCard";
import { cn } from "@/lib/utils";

/**
 * CategorySection
 * - Props:
 *   - categories: array of { id, name, image, slug, url }
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
  const safeCategories = React.useMemo(() => {
    if (!categories) return [];
    if (Array.isArray(categories)) return categories;
    if (typeof categories === "object") {
      if (Array.isArray(categories.data)) return categories.data;
      if (Array.isArray(categories.categories)) return categories.categories;
      return Object.values(categories);
    }
    return [categories];
  }, [categories]);

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
          {safeCategories.length === 0 ? (
            <div className="col-span-full text-sm text-muted-foreground">
              No categories
            </div>
          ) : (
            safeCategories.map((cat, i) => {
              // use slug as primary key; fallback to `${name}-${index}` to guarantee uniqueness
              const key =
                cat && cat.slug ? cat.slug : `${cat?.name ?? "cat"}-${i}`;

              return (
                <CategoryCard
                  key={key}
                  category={cat}
                  onClick={() => onSelect?.(cat)}
                />
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
