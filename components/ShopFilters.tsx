"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
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
    <div className="space-y-8">
      <fieldset>
        <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-darkColor">
          Category
        </legend>
        <div className="space-y-1.5">
          <button
            onClick={() => applyParams({ category: undefined })}
            aria-pressed={!activeCategory}
            className={cn(
              "block w-full rounded-md px-2.5 py-1.5 text-left text-sm transition-colors duration-200 hover:bg-shop_light_bg",
              !activeCategory
                ? "bg-shop_light_pink font-semibold text-shop_dark_green"
                : "text-lightColor",
            )}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => applyParams({ category: category.slug })}
              aria-pressed={activeCategory === category.slug}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors duration-200 hover:bg-shop_light_bg",
                activeCategory === category.slug
                  ? "bg-shop_light_pink font-semibold text-shop_dark_green"
                  : "text-lightColor",
              )}
            >
              <Image
                src={category.image}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 rounded-md border border-black/5 object-cover"
              />
              <span className="truncate">{category.title}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-darkColor">
          Brand
        </legend>
        <div className="space-y-1.5">
          <button
            onClick={() => applyParams({ brand: undefined })}
            aria-pressed={!activeBrand}
            className={cn(
              "block w-full rounded-md px-2.5 py-1.5 text-left text-sm transition-colors duration-200 hover:bg-shop_light_bg",
              !activeBrand
                ? "bg-shop_light_pink font-semibold text-shop_dark_green"
                : "text-lightColor",
            )}
          >
            All Brands
          </button>
          {brands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => applyParams({ brand: brand.slug })}
              aria-pressed={activeBrand === brand.slug}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors duration-200 hover:bg-shop_light_bg",
                activeBrand === brand.slug
                  ? "bg-shop_light_pink font-semibold text-shop_dark_green"
                  : "text-lightColor",
              )}
            >
              <Image
                src={brand.image}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 rounded-md border border-black/5 object-cover"
              />
              <span className="truncate">{brand.title}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-darkColor">
          Price
        </legend>
        <div className="space-y-1.5">
          <button
            onClick={() => applyParams({ min: undefined, max: undefined })}
            aria-pressed={!activeMin && !activeMax}
            className={cn(
              "block w-full rounded-md px-2.5 py-1.5 text-left text-sm transition-colors duration-200 hover:bg-shop_light_bg",
              !activeMin && !activeMax
                ? "bg-shop_light_pink font-semibold text-shop_dark_green"
                : "text-lightColor",
            )}
          >
            Any Price
          </button>
          {priceRanges.map((range) => (
            <button
              key={range.label}
              onClick={() =>
                applyParams({
                  min: range.min?.toString(),
                  max: range.max?.toString(),
                })
              }
              aria-pressed={isRangeActive(range)}
              className={cn(
                "block w-full rounded-md px-2.5 py-1.5 text-left text-sm transition-colors duration-200 hover:bg-shop_light_bg",
                isRangeActive(range)
                  ? "bg-shop_light_pink font-semibold text-shop_dark_green"
                  : "text-lightColor",
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </fieldset>

      {hasActiveFilters && (
        <button
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
