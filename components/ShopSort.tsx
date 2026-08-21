"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { SortOption } from "@/types";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A to Z" },
];

const ShopSort = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") ?? "newest";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    params.delete("page");
    router.replace(`/shop${params.size ? `?${params}` : ""}`, {
      scroll: false,
    });
  };

  return (
    <label className="flex items-center gap-2 text-sm text-lightColor">
      <span className="hidden sm:inline">Sort by</span>
      <select
        value={currentSort}
        onChange={(event) => handleChange(event.target.value)}
        aria-label="Sort products"
        className="h-9 cursor-pointer rounded-lg border border-black/15 bg-white px-2.5 text-sm text-darkColor outline-none transition-colors duration-200 focus:border-shop_light_green"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default ShopSort;
