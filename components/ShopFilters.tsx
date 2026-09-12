"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Brand, Category } from "@/types";

interface PriceRange {
  label: string;
  min?: number;
  max?: number;
}

const priceRanges: PriceRange[] = [
  { label: "Under Rs. 250", max: 250 },
  { label: "Rs. 250 – 500", min: 250, max: 500 },
  { label: "Rs. 500 – 1,000", min: 500, max: 1000 },
  { label: "Rs. 1,000 – 2,500", min: 1000, max: 2500 },
  { label: "Rs. 2,500 & above", min: 2500 },
];

const BRANDS_PREVIEW = 5;

function hasRealImage(url?: string | null) {
  if (!url) return false;
  return !url.includes("placeholder");
}

function FilterThumb({
  src,
  title,
}: {
  src?: string | null;
  title: string;
}) {
  if (hasRealImage(src)) {
    return (
      <Image
        src={src!}
        alt=""
        width={28}
        height={28}
        className="h-7 w-7 shrink-0 rounded-md border border-black/5 object-cover"
      />
    );
  }

  const initial = (title.trim().charAt(0) || "?").toUpperCase();
  return (
    <span
      aria-hidden
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-black/10 bg-shop_light_bg text-[11px] font-semibold text-shop_dark_green"
    >
      {initial}
    </span>
  );
}

const filterBtn =
  "flex w-full min-w-0 items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors duration-200 hover:bg-shop_light_bg";

interface ShopFiltersProps {
  categories: Category[];
  brands: Brand[];
  /** Called after a filter changes (used to close the mobile drawer). */
  onChange?: () => void;
}

const ShopFilters = ({ categories, brands, onChange }: ShopFiltersProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") ?? "";
  const activeBrand = searchParams.get("brand") ?? "";
  const activeMin = searchParams.get("min") ?? "";
  const activeMax = searchParams.get("max") ?? "";
  const hasActiveFilters = Boolean(
    activeCategory || activeBrand || activeMin || activeMax,
  );

  const activeBrandIndex = useMemo(
    () => brands.findIndex((brand) => brand.slug === activeBrand),
    [brands, activeBrand],
  );

  const [brandsExpanded, setBrandsExpanded] = useState(
    () => activeBrandIndex >= BRANDS_PREVIEW,
  );

  const visibleBrands =
    brandsExpanded || brands.length <= BRANDS_PREVIEW
      ? brands
      : brands.slice(0, BRANDS_PREVIEW);
  const hiddenBrandCount = Math.max(0, brands.length - BRANDS_PREVIEW);

  const applyParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    params.delete("page");
    router.replace(`/shop${params.size ? `?${params}` : ""}`, {
      scroll: false,
    });
    onChange?.();
  };

  const isRangeActive = (range: PriceRange) =>
    activeMin === (range.min?.toString() ?? "") &&
    activeMax === (range.max?.toString() ?? "");

  return (
    <div className="min-w-0 space-y-8 overflow-hidden">
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-darkColor">
          Category
        </p>
        <div className="min-w-0 space-y-1.5">
          <button
            type="button"
            onClick={() => applyParams({ category: undefined })}
            aria-pressed={!activeCategory}
            className={cn(
              filterBtn,
              !activeCategory
                ? "bg-shop_light_pink font-semibold text-shop_dark_green"
                : "text-lightColor",
            )}
          >
            <span className="min-w-0 truncate">All Categories</span>
          </button>
          {categories.map((category) => (
            <button
              type="button"
              key={category.id}
              onClick={() => applyParams({ category: category.slug })}
              aria-pressed={activeCategory === category.slug}
              className={cn(
                filterBtn,
                activeCategory === category.slug
                  ? "bg-shop_light_pink font-semibold text-shop_dark_green"
                  : "text-lightColor",
              )}
            >
              <FilterThumb src={category.image} title={category.title} />
              <span className="min-w-0 truncate">{category.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="min-w-0">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-darkColor">
          Brand
        </p>
        <div className="min-w-0 space-y-1.5">
          <button
            type="button"
            onClick={() => applyParams({ brand: undefined })}
            aria-pressed={!activeBrand}
            className={cn(
              filterBtn,
              !activeBrand
                ? "bg-shop_light_pink font-semibold text-shop_dark_green"
                : "text-lightColor",
            )}
          >
            <span className="min-w-0 truncate">All Brands</span>
          </button>
          {visibleBrands.map((brand) => (
            <button
              type="button"
              key={brand.id}
              onClick={() => applyParams({ brand: brand.slug })}
              aria-pressed={activeBrand === brand.slug}
              title={brand.title}
              className={cn(
                filterBtn,
                activeBrand === brand.slug
                  ? "bg-shop_light_pink font-semibold text-shop_dark_green"
                  : "text-lightColor",
              )}
            >
              <FilterThumb src={brand.image} title={brand.title} />
              <span className="min-w-0 truncate">{brand.title}</span>
            </button>
          ))}
          {hiddenBrandCount > 0 ? (
            <button
              type="button"
              onClick={() => setBrandsExpanded((open) => !open)}
              aria-expanded={brandsExpanded}
              className="mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-semibold text-shop_btn_dark_green transition-colors hover:bg-shop_light_pink"
            >
              {brandsExpanded ? (
                <>
                  Show less
                  <ChevronUp className="h-4 w-4" aria-hidden />
                </>
              ) : (
                <>
                  Show {hiddenBrandCount} more
                  <ChevronDown className="h-4 w-4" aria-hidden />
                </>
              )}
            </button>
          ) : null}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-darkColor">
          Price
        </p>
        <div className="min-w-0 space-y-1.5">
          <button
            type="button"
            onClick={() => applyParams({ min: undefined, max: undefined })}
            aria-pressed={!activeMin && !activeMax}
            className={cn(
              filterBtn,
              !activeMin && !activeMax
                ? "bg-shop_light_pink font-semibold text-shop_dark_green"
                : "text-lightColor",
            )}
          >
            <span className="min-w-0 truncate">Any Price</span>
          </button>
          {priceRanges.map((range) => (
            <button
              type="button"
              key={range.label}
              onClick={() =>
                applyParams({
                  min: range.min?.toString(),
                  max: range.max?.toString(),
                })
              }
              aria-pressed={isRangeActive(range)}
              className={cn(
                filterBtn,
                isRangeActive(range)
                  ? "bg-shop_light_pink font-semibold text-shop_dark_green"
                  : "text-lightColor",
              )}
            >
              <span className="min-w-0 truncate">{range.label}</span>
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() =>
            applyParams({
              category: undefined,
              brand: undefined,
              min: undefined,
              max: undefined,
            })
          }
          className="w-full rounded-lg border border-shop_orange/40 px-4 py-2 text-sm font-semibold text-shop_orange transition-colors duration-200 hover:bg-shop_orange hover:text-white"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
};

export default ShopFilters;
