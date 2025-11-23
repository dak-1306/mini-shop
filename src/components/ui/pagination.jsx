import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Pagination component (re-uses Button + lucide-react icons)
 *
 * Props:
 * - page (number) current page (1-based)
 * - total (number) total items
 * - pageSize (number) items per page
 * - onPageChange (fn) called with new page number
 * - siblingCount (number) pages to show around current (default 1)
 * - className (string) optional container class
 */
function range(from, to) {
  const out = [];
  for (let i = from; i <= to; i += 1) out.push(i);
  return out;
}

export default function Pagination({
  page = 1,
  total = 0,
  pageSize = 20,
  onPageChange,
  siblingCount = 1,
  className = "",
}) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));
  const current = Math.min(Math.max(1, Number(page || 1)), totalPages);

  if (totalPages <= 1) return null;

  const totalPageNumbers = siblingCount * 2 + 5; // first + last + current +/- siblings + 2 ellipses
  let pages = [];

  if (totalPages <= totalPageNumbers) {
    pages = range(1, totalPages);
  } else {
    const leftSiblingIndex = Math.max(current - siblingCount, 1);
    const rightSiblingIndex = Math.min(current + siblingCount, totalPages);

    const showLeftEllipsis = leftSiblingIndex > 2;
    const showRightEllipsis = rightSiblingIndex < totalPages - 1;

    if (!showLeftEllipsis && showRightEllipsis) {
      const leftItemCount = 3 + 2 * siblingCount;
      pages = [...range(1, leftItemCount), "...", totalPages];
    } else if (showLeftEllipsis && !showRightEllipsis) {
      const rightItemCount = 3 + 2 * siblingCount;
      pages = [1, "...", ...range(totalPages - rightItemCount + 1, totalPages)];
    } else {
      pages = [
        1,
        "...",
        ...range(leftSiblingIndex, rightSiblingIndex),
        "...",
        totalPages,
      ];
    }
  }

  const goto = (p) => {
    if (
      !onPageChange ||
      p === "..." ||
      p < 1 ||
      p > totalPages ||
      p === current
    )
      return;
    onPageChange(p);
  };

  return (
    <nav
      aria-label="Pagination"
      className={`w-full flex items-center justify-center ${className}`}
    >
      <div className="inline-flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => goto(1)}
          disabled={current === 1}
          aria-label="First page"
          title="Đến đầu"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => goto(current - 1)}
          disabled={current === 1}
          aria-label="Previous page"
          title="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {pages.map((p, idx) =>
          p === "..." ? (
            <span
              key={`dots-${idx}`}
              className="px-3 py-1 text-sm text-muted-foreground select-none"
            >
              …
            </span>
          ) : (
            <Button
              key={p}
              size="sm"
              variant={p === current ? "default" : "outline"}
              onClick={() => goto(p)}
              aria-current={p === current ? "page" : undefined}
              title={
                p === current ? `Trang hiện tại ${p}` : `Chuyển tới trang ${p}`
              }
            >
              {p}
            </Button>
          )
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={() => goto(current + 1)}
          disabled={current === totalPages}
          aria-label="Next page"
          title="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => goto(totalPages)}
          disabled={current === totalPages}
          aria-label="Last page"
          title="Đến cuối"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </nav>
  );
}
