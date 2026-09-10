import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShopPaginationProps {
  page: number;
  totalPages: number;
  searchParams: Record<string, string>;
}

function buildHref(searchParams: Record<string, string>, page: number) {
  const params = new URLSearchParams(searchParams);
  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", page.toString());
  }
  return `/shop${params.size ? `?${params}` : ""}`;
}

/** Build a compact page list like: 1 … 4 5 [6] 7 8 … 120 */
function getVisiblePages(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const siblings = 1;
  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);
  for (let p = current - siblings; p <= current + siblings; p += 1) {
    if (p >= 1 && p <= total) pages.add(p);
  }
  // Keep a little more context near the ends
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (current >= total - 2) {
    pages.add(total - 1);
    pages.add(total - 2);
    pages.add(total - 3);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("ellipsis");
    result.push(p);
    prev = p;
  }
  return result;
}

const pageBtnClass =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors duration-200";

const ShopPagination = ({
  page,
  totalPages,
  searchParams,
}: ShopPaginationProps) => {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(page, totalPages);

  return (
    <nav
      aria-label="Product pages"
      className="mt-10 flex flex-wrap items-center justify-center gap-1.5"
    >
      {page > 1 ? (
        <Link
          href={buildHref(searchParams, page - 1)}
          aria-label="Previous page"
          className={cn(
            pageBtnClass,
            "border-black/15 hover:border-shop_light_green hover:text-shop_light_green",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span
          className={cn(
            pageBtnClass,
            "border-black/10 text-lightColor/40",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {pages.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden
            className="inline-flex h-9 min-w-9 items-center justify-center text-sm text-lightColor"
          >
            …
          </span>
        ) : (
          <Link
            key={item}
            href={buildHref(searchParams, item)}
            aria-current={item === page ? "page" : undefined}
            className={cn(
              pageBtnClass,
              "px-2",
              item === page
                ? "border-shop_btn_dark_green bg-shop_btn_dark_green text-white"
                : "border-black/15 text-lightColor hover:border-shop_light_green hover:text-shop_light_green",
            )}
          >
            {item}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link
          href={buildHref(searchParams, page + 1)}
          aria-label="Next page"
          className={cn(
            pageBtnClass,
            "border-black/15 hover:border-shop_light_green hover:text-shop_light_green",
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span
          className={cn(
            pageBtnClass,
            "border-black/10 text-lightColor/40",
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
};

export default ShopPagination;
