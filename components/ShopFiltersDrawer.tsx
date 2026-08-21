"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import ShopFilters from "./ShopFilters";
import { useOutsideClick } from "@/hooks";
import type { Brand, Category } from "@/types";

interface ShopFiltersDrawerProps {
  categories: Category[];
  brands: Brand[];
}

const ShopFiltersDrawer = ({ categories, brands }: ShopFiltersDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useOutsideClick<HTMLDivElement>(() => setIsOpen(false));

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-black/15 bg-white px-3.5 text-sm font-medium text-darkColor transition-colors duration-200 hover:border-shop_light_green"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        Filters
      </button>

      <div
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Product filters"
          className={`h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-6 transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-base font-semibold text-darkColor">Filters</h2>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close filters"
              className="transition-colors duration-200 hover:text-shop_light_green"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <ShopFilters
            categories={categories}
            brands={brands}
            onChange={() => setIsOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default ShopFiltersDrawer;
