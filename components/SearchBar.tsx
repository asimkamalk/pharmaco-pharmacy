"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { formatPrice, getDiscountedPrice } from "@/lib/utils";
import type { Brand, Category, Product } from "@/types";

const SearchBar = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setProducts([]);
      setCategories([]);
      setBrands([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/catalog/search?q=${encodeURIComponent(trimmed)}`,
        );
        if (!response.ok) return;
        const data = await response.json();
        setProducts(data.products ?? []);
        setCategories(data.categories ?? []);
        setBrands(data.brands ?? []);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const navigate = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-full items-center gap-2 rounded-full border border-black/10 bg-shop_light_bg px-3 text-left text-sm text-lightColor transition-colors hover:border-shop_light_green/40"
        aria-label="Search products"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate">Search medicines, brands…</span>
        <kbd className="hidden rounded border border-black/10 bg-white px-1.5 py-0.5 text-[10px] font-medium sm:inline">
          Ctrl K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search products, categories, brands…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? "Searching…" : "No results found."}
            </CommandEmpty>

            {products.length > 0 && (
              <CommandGroup heading="Products">
                {products.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.slug}
                    onSelect={() => navigate(`/product/${product.slug}`)}
                    className="gap-3"
                  >
                    <Image
                      src={product.images[0]}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(
                          getDiscountedPrice(product.price, product.discount),
                        )}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {categories.length > 0 && (
              <CommandGroup heading="Categories">
                {categories.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={`cat-${category.slug}`}
                    onSelect={() =>
                      navigate(`/shop?category=${category.slug}`)
                    }
                  >
                    {category.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {brands.length > 0 && (
              <CommandGroup heading="Brands">
                {brands.map((brand) => (
                  <CommandItem
                    key={brand.id}
                    value={`brand-${brand.slug}`}
                    onSelect={() => navigate(`/shop?brand=${brand.slug}`)}
                  >
                    {brand.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
};

export default SearchBar;
