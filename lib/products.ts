import { brandsData, categoriesData, productsData } from "@/constants/data";
import { getDiscountedPrice } from "@/lib/utils";
import type {
  Brand,
  Category,
  PaginatedProducts,
  Product,
  ProductFilters,
  SortOption,
} from "@/types";

/**
 * Data-access layer for the catalog.
 *
 * Currently backed by the sample data in `constants/data.ts`. When the
 * database is introduced (Prisma + PostgreSQL), only this file needs to
 * change — every page/component consumes these functions.
 */

const DEFAULT_PAGE_SIZE = 12;

export async function getCategories(): Promise<Category[]> {
  return categoriesData;
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | undefined> {
  return categoriesData.find((category) => category.slug === slug);
}

export async function getBrands(): Promise<Brand[]> {
  return brandsData;
}

export async function getBrandBySlug(
  slug: string,
): Promise<Brand | undefined> {
  return brandsData.find((brand) => brand.slug === slug);
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  return productsData.find((product) => product.slug === slug);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return productsData.filter((product) => product.isFeatured).slice(0, limit);
}

export async function getBestSellers(limit = 8): Promise<Product[]> {
  return [...productsData]
    .sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
    .slice(0, limit);
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  return productsData
    .filter(
      (item) =>
        item.categorySlug === product.categorySlug && item.id !== product.id,
    )
    .slice(0, limit);
}

export async function getProductCountByCategory(): Promise<
  Record<string, number>
> {
  return productsData.reduce<Record<string, number>>((counts, product) => {
    counts[product.categorySlug] = (counts[product.categorySlug] ?? 0) + 1;
    return counts;
  }, {});
}

export async function getProductCountByBrand(): Promise<
  Record<string, number>
> {
  return productsData.reduce<Record<string, number>>((counts, product) => {
    counts[product.brandSlug] = (counts[product.brandSlug] ?? 0) + 1;
    return counts;
  }, {});
}

function matchesQuery(product: Product, query: string): boolean {
  const haystack = [
    product.name,
    product.genericName,
    product.manufacturer,
    categoriesData.find((c) => c.slug === product.categorySlug)?.title,
    brandsData.find((b) => b.slug === product.brandSlug)?.title,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return query
    .toLowerCase()
    .split(/\s+/)
    .every((term) => haystack.includes(term));
}

function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];
  switch (sort) {
    case "price-asc":
      return sorted.sort(
        (a, b) =>
          getDiscountedPrice(a.price, a.discount) -
          getDiscountedPrice(b.price, b.discount),
      );
    case "price-desc":
      return sorted.sort(
        (a, b) =>
          getDiscountedPrice(b.price, b.discount) -
          getDiscountedPrice(a.price, a.discount),
      );
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "newest":
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
}

export async function getProducts(
  filters: ProductFilters = {},
): Promise<PaginatedProducts> {
  const {
    query,
    category,
    brand,
    minPrice,
    maxPrice,
    sort = "newest",
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  } = filters;

  let results = productsData;

  if (query?.trim()) {
    results = results.filter((product) => matchesQuery(product, query.trim()));
  }
  if (category) {
    results = results.filter((product) => product.categorySlug === category);
  }
  if (brand) {
    results = results.filter((product) => product.brandSlug === brand);
  }
  if (minPrice !== undefined) {
    results = results.filter(
      (product) =>
        getDiscountedPrice(product.price, product.discount) >= minPrice,
    );
  }
  if (maxPrice !== undefined) {
    results = results.filter(
      (product) =>
        getDiscountedPrice(product.price, product.discount) <= maxPrice,
    );
  }

  results = sortProducts(results, sort);

  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    products: results.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export async function searchProducts(
  query: string,
  limit = 8,
): Promise<Product[]> {
  if (!query.trim()) return [];
  return productsData
    .filter((product) => matchesQuery(product, query.trim()))
    .slice(0, limit);
}
