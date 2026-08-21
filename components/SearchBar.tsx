"use client";

import { useEffect, useMemo, useState } from "react";
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
import { brandsData, categoriesData, productsData } from "@/constants/data";
import { formatPrice, getDiscountedPrice } from "@/lib/utils";

const MAX_SUGGESTIONS = 6;

const SearchBar = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

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

  const trimmed = query.trim().toLowerCase();

  const productResults = useMemo(() => {
    if (!trimmed) return [];
    return productsData
      .filter((product) => {
        const category = categoriesData.find(
          (c) => c.slug === product.categorySlug,
        );
        const brand = brandsData.find((b) => b.slug === product.brandSlug);
        const haystack = [
          product.name,
          product.genericName,
          product.manufacturer,
          category?.title,
          brand?.title,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return trimmed.split(/\s+/).every((term) => haystack.includes(term));
      })
      .slice(0, MAX_SUGGESTIONS);
  }, [trimmed]);

  const categoryResults = useMemo(() => {
    if (!trimmed) return [];
    return categoriesData
      .filter((category) => category.title.toLowerCase().includes(trimmed))
      .slice(0, 3);
  }, [trimmed]);

  const brandResults = useMemo(() => {
    if (!trimmed) return [];
    return brandsData
      .filter((brand) => brand.title.toLowerCase().includes(trimmed))
      .slice(0, 3);
  }, [trimmed]);

  const navigate = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Search products"
        className="inline-flex items-center justify-center"
      >
        <Search className="h-5 w-5 transition-colors duration-200 hover:text-shop_light_green" />
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search products"
        description="Search medicines and health products"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search medicines, brands, categories..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {trimmed ? (
              <>
                <CommandEmpty>
                  No products found for &ldquo;{query.trim()}&rdquo;. Try a
                  different name or brand.
                </CommandEmpty>

                {productResults.length > 0 && (
                  <CommandGroup heading="Products">
                    {productResults.map((product) => (
                      <CommandItem
                        key={product.id}
                        value={product.slug}
                        onSelect={() => navigate(`/product/${product.slug}`)}
                      >
                        <Image
                          src={product.images[0]}
                          alt=""
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-md border object-cover"
                        />
                        <span className="flex-1 truncate">{product.name}</span>
                        <span className="font-semibold text-shop_dark_green">
                          {formatPrice(
                            getDiscountedPrice(product.price, product.discount),
                          )}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {categoryResults.length > 0 && (
                  <CommandGroup heading="Categories">
                    {categoryResults.map((category) => (
                      <CommandItem
                        key={category.id}
                        value={`category-${category.slug}`}
                        onSelect={() =>
                          navigate(`/shop?category=${category.slug}`)
                        }
                      >
                        <span className="flex-1 truncate">
                          {category.title}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {brandResults.length > 0 && (
                  <CommandGroup heading="Brands">
                    {brandResults.map((brand) => (
                      <CommandItem
                        key={brand.id}
                        value={`brand-${brand.slug}`}
                        onSelect={() => navigate(`/shop?brand=${brand.slug}`)}
                      >
                        <span className="flex-1 truncate">{brand.title}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {productResults.length > 0 && (
                  <CommandGroup>
                    <CommandItem
                      value={`view-all-${trimmed}`}
                      onSelect={() =>
                        navigate(`/shop?q=${encodeURIComponent(query.trim())}`)
                      }
                    >
                      <Search />
                      <span>
                        View all results for &ldquo;{query.trim()}&rdquo;
                      </span>
                    </CommandItem>
                  </CommandGroup>
                )}
              </>
            ) : (
              <CommandGroup heading="Popular categories">
                {categoriesData.slice(0, 6).map((category) => (
                  <CommandItem
                    key={category.id}
                    value={`category-${category.slug}`}
                    onSelect={() => navigate(`/shop?category=${category.slug}`)}
                  >
                    <span>{category.title}</span>
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
