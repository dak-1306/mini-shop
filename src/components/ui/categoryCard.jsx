import React from "react";
import { cn } from "@/lib/utils";
import placeholder from "@/assets/placeholder-category.svg";

/**
 * CategoryCard
 * - Props:
 *   - category: { id, name, image }
 *   - onClick: (category) => void
 *   - className: additional classes
 *
 * Behavior:
 * - shows image
 * - on hover / focus shows semi-opaque overlay with the category name
 * - accessible via keyboard (Enter/Space)
 */
export default function CategoryCard({ category = {}, onClick, className }) {
  const handleKeyDown = (e) => {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(category);
    }
  };

  const src = category?.image ?? category?.img ?? placeholder;
  const alt = category?.name ?? category?.slug ?? "Category";

  return (
    <div
      role={onClick ? "button" : "group"}
      tabIndex={0}
      aria-label={category.name}
      onClick={() => onClick?.(category)}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative overflow-hidden rounded-md shadow-sm cursor-pointer group focus:outline-none focus:ring-2 focus:ring-offset-2",
        className
      )}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full h-32 object-cover rounded"
        onError={(e) => {
          // nếu src lỗi thì fallback về placeholder local
          if (e.currentTarget.src !== placeholder)
            e.currentTarget.src = placeholder;
        }}
      />
      {/* overlay: hidden by default, visible on hover/focus */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/40 group-focus:bg-black/40">
        <span className="opacity-0 transform translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-focus:opacity-100 group-focus:translate-y-0 text-white text-sm font-medium px-3 py-1 bg-black/60 rounded">
          {category.name}
        </span>
      </div>
    </div>
  );
}
