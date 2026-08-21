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
  const [isSuggestions, setIsSuggestions] = useState(true);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    const handleOpenSearch = () => setOpen(true);
    document.addEventListener("keydown", handleShortcut);
    window.addEventListener("pharmaco:open-search", handleOpenSearch);
    return () => {
      document.removeEventListener("keydown", handleShortcut);
      window.removeEventListener("pharmaco:open-search", handleOpenSearch);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
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
        setIsSuggestions(Boolean(data.suggestions) || !trimmed);
      } finally {
        setLoading(false);
      }
    }, trimmed ? 200 : 0);

    return () => clearTimeout(timer);
  }, [query, open]);

  const navigate = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  const hasResults =
    products.length > 0 || categories.length > 0 || brands.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-shop_light_bg text-lightColor transition-colors hover:border-shop_light_green/40 hover:text-shop_dark_green md:flex md:w-auto md:max-w-[11rem] md:justify-start md:gap-2 md:px-3 lg:max-w-[14rem]"
        aria-label="Search products"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden min-w-0 flex-1 truncate text-left text-sm md:inline">
          Search…
        </span>
        <kbd className="hidden rounded border border-black/10 bg-white px-1.5 py-0.5 text-[10px] font-medium lg:inline">
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
            {!hasResults && (
              <CommandEmpty>
                {loading
                  ? "Searching…"
                  : query.trim()
                    ? "No results found."
                    : "No suggestions available."}
              </CommandEmpty>
            )}

            {products.length > 0 && (
              <CommandGroup
                heading={isSuggestions ? "Popular products" : "Products"}
              >
                {products.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.slug}
                    onSelect={() => navigate(`/product/${product.slug}`)}
                    className="gap-3"
                  >
                    <Image
                      src={product.images[0]}
                      alt={product.imageAlts?.[0] || product.name}
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
                    className="gap-3"
                  >
                    <Image
                      src={category.image}
                      alt={category.imageAlt || category.title}
                      width={28}
                      height={28}
                      className="h-7 w-7 rounded object-cover"
                    />
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
                    className="gap-3"
                  >
                    <Image
                      src={brand.image}
                      alt={brand.imageAlt || brand.title}
                      width={28}
                      height={28}
                      className="h-7 w-7 rounded object-cover"
                    />
                    {brand.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {isSuggestions && hasResults && (
              <CommandGroup heading="Quick links">
                <CommandItem value="shop-all" onSelect={() => navigate("/shop")}>
                  Browse all products
                </CommandItem>
                <CommandItem
                  value="categories-all"
                  onSelect={() => navigate("/categories")}
                >
                  View all categories
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
};

export default SearchBar;
