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

const ShopPagination = ({
  page,
  totalPages,
  searchParams,
}: ShopPaginationProps) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav
      aria-label="Product pages"
      className="mt-10 flex items-center justify-center gap-1.5"
    >
      {page > 1 ? (
        <Link
          href={buildHref(searchParams, page - 1)}
          aria-label="Previous page"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/15 transition-colors duration-200 hover:border-shop_light_green hover:text-shop_light_green"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 text-lightColor/40">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {pages.map((pageNumber) => (
        <Link
          key={pageNumber}
          href={buildHref(searchParams, pageNumber)}
          aria-current={pageNumber === page ? "page" : undefined}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors duration-200",
            pageNumber === page
              ? "border-shop_btn_dark_green bg-shop_btn_dark_green text-white"
              : "border-black/15 text-lightColor hover:border-shop_light_green hover:text-shop_light_green",
          )}
        >
          {pageNumber}
        </Link>
      ))}

      {page < totalPages ? (
        <Link
          href={buildHref(searchParams, page + 1)}
          aria-label="Next page"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/15 transition-colors duration-200 hover:border-shop_light_green hover:text-shop_light_green"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 text-lightColor/40">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
};

export default ShopPagination;
