import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import Container from "@/components/Container";
import EmptyState from "@/components/EmptyState";
import ProductCard from "@/components/ProductCard";
import ShopFilters from "@/components/ShopFilters";
import ShopFiltersDrawer from "@/components/ShopFiltersDrawer";
import ShopPagination from "@/components/ShopPagination";
import ShopSort from "@/components/ShopSort";
import {
  getBrandBySlug,
  getBrands,
  getCategories,
  getCategoryBySlug,
  getProducts,
} from "@/lib/products";
import { siteConfig } from "@/constants/site";
import type { SortOption } from "@/types";

export const metadata: Metadata = {
  title: "Shop",
  description: `Browse medicines, vitamins, personal care and health products at ${siteConfig.name}, ${siteConfig.location.area}, ${siteConfig.location.city}.`,
};

const validSorts: SortOption[] = ["newest", "price-asc", "price-desc", "name"];

interface ShopPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toNumber(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

const ShopPage = async ({ searchParams }: ShopPageProps) => {
  const params = await searchParams;

  const query = firstValue(params.q);
  const category = firstValue(params.category);
  const brand = firstValue(params.brand);
  const minPrice = toNumber(firstValue(params.min));
  const maxPrice = toNumber(firstValue(params.max));
  const sortParam = firstValue(params.sort);
  const sort = validSorts.includes(sortParam as SortOption)
    ? (sortParam as SortOption)
    : "newest";
  const page = toNumber(firstValue(params.page)) ?? 1;

  const [categories, brands, result, activeCategory, activeBrand] =
    await Promise.all([
      getCategories(),
      getBrands(),
      getProducts({ query, category, brand, minPrice, maxPrice, sort, page }),
      category ? getCategoryBySlug(category) : Promise.resolve(undefined),
      brand ? getBrandBySlug(brand) : Promise.resolve(undefined),
    ]);

  const currentParams: Record<string, string> = {};
  for (const key of ["q", "category", "brand", "min", "max", "sort"]) {
    const value = firstValue(params[key]);
    if (value) currentParams[key] = value;
  }

  const heading =
    activeCategory?.title ?? activeBrand?.title ?? (query ? "Search" : "Shop");

  const description = query
    ? null
    : (activeCategory?.description ??
      activeBrand?.description ??
      "Medicines, wellness and healthcare essentials");

  return (
    <main className="bg-white">
      <Container className="py-8 sm:py-10">
        <header>
          <h1 className="text-2xl font-bold text-darkColor sm:text-3xl">
            {heading}
          </h1>
          <p className="mt-1.5 text-sm text-lightColor">
            {query ? (
              <>
                Search results for{" "}
                <span className="font-semibold text-darkColor">
                  &ldquo;{query}&rdquo;
                </span>{" "}
                — {result.total} product{result.total === 1 ? "" : "s"} found
              </>
            ) : (
              <>
                {description} — {result.total} product
                {result.total === 1 ? "" : "s"}
              </>
            )}
          </p>
        </header>

        <div className="mt-6 flex gap-8">
          <aside
            aria-label="Product filters"
            className="hidden w-64 shrink-0 lg:block"
          >
            <div className="sticky top-6 rounded-xl border border-black/10 bg-white p-5">
              <ShopFilters categories={categories} brands={brands} />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-5 flex items-center justify-between gap-3">
              <ShopFiltersDrawer categories={categories} brands={brands} />
              <ShopSort />
            </div>

            {result.products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                  {result.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <ShopPagination
                  page={result.page}
                  totalPages={result.totalPages}
                  searchParams={currentParams}
                />
              </>
            ) : (
              <EmptyState
                icon={PackageSearch}
                title="No products found"
                description={
                  query
                    ? `We couldn't find anything matching "${query}". Try a different search term or clear the filters.`
                    : "No products match the selected filters. Try adjusting or clearing them."
                }
                actionLabel="Clear filters"
                actionHref="/shop"
              />
            )}
          </div>
        </div>
      </Container>
    </main>
  );
};

export default ShopPage;
