import { prisma } from "@/lib/prisma";
import { mapBrand, mapCategory, mapProduct } from "@/lib/mappers";
import { getDiscountedPrice } from "@/lib/utils";
import type {
  Brand,
  Category,
  PaginatedProducts,
  Product,
  ProductFilters,
  SortOption,
} from "@/types";

const DEFAULT_PAGE_SIZE = 12;

const productInclude = {
  category: { select: { slug: true, title: true } },
  brand: { select: { slug: true, title: true } },
  images: { select: { url: true, sortOrder: true } },
} as const;

export async function getCategories(): Promise<Category[]> {
  const rows = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { title: "asc" },
  });
  return rows.map(mapCategory);
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | undefined> {
  const row = await prisma.category.findFirst({
    where: { slug, isActive: true },
  });
  return row ? mapCategory(row) : undefined;
}

export async function getBrands(): Promise<Brand[]> {
  const rows = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { title: "asc" },
  });
  return rows.map(mapBrand);
}

export async function getBrandBySlug(
  slug: string,
): Promise<Brand | undefined> {
  const row = await prisma.brand.findFirst({
    where: { slug, isActive: true },
  });
  return row ? mapBrand(row) : undefined;
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const row = await prisma.product.findFirst({
    where: { slug, isArchived: false },
    include: productInclude,
  });
  return row ? mapProduct(row) : undefined;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return [];
  const rows = await prisma.product.findMany({
    where: { id: { in: unique }, isArchived: false },
    include: productInclude,
  });
  const map = Object.fromEntries(rows.map((row) => [row.id, mapProduct(row)]));
  return unique.map((id) => map[id]).filter(Boolean) as Product[];
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { isFeatured: true, isArchived: false },
    include: productInclude,
    take: limit,
    orderBy: { updatedAt: "desc" },
  });
  return rows.map((row) => mapProduct(row));
}

export async function getBestSellers(limit = 8): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { isArchived: false },
    include: productInclude,
    orderBy: { reviewCount: "desc" },
    take: limit,
  });
  return rows.map((row) => mapProduct(row));
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: {
      isArchived: false,
      id: { not: product.id },
      category: { slug: product.categorySlug },
    },
    include: productInclude,
    take: limit,
  });
  return rows.map((row) => mapProduct(row));
}

export async function getProductCountByCategory(): Promise<
  Record<string, number>
> {
  const groups = await prisma.product.groupBy({
    by: ["categoryId"],
    where: { isArchived: false },
    _count: { _all: true },
  });
  const categories = await prisma.category.findMany({
    select: { id: true, slug: true },
  });
  const idToSlug = Object.fromEntries(
    categories.map((category) => [category.id, category.slug]),
  );
  return groups.reduce<Record<string, number>>((counts, group) => {
    const slug = idToSlug[group.categoryId];
    if (slug) counts[slug] = group._count._all;
    return counts;
  }, {});
}

export async function getProductCountByBrand(): Promise<
  Record<string, number>
> {
  const groups = await prisma.product.groupBy({
    by: ["brandId"],
    where: { isArchived: false },
    _count: { _all: true },
  });
  const brands = await prisma.brand.findMany({
    select: { id: true, slug: true },
  });
  const idToSlug = Object.fromEntries(
    brands.map((brand) => [brand.id, brand.slug]),
  );
  return groups.reduce<Record<string, number>>((counts, group) => {
    const slug = idToSlug[group.brandId];
    if (slug) counts[slug] = group._count._all;
    return counts;
  }, {});
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
    includeArchived = false,
  } = filters;

  const rows = await prisma.product.findMany({
    where: {
      isArchived: includeArchived ? undefined : false,
      ...(category ? { category: { slug: category } } : {}),
      ...(brand ? { brand: { slug: brand } } : {}),
      ...(query?.trim()
        ? {
            OR: [
              { name: { contains: query.trim() } },
              { genericName: { contains: query.trim() } },
              { manufacturer: { contains: query.trim() } },
              { sku: { contains: query.trim() } },
              { brand: { title: { contains: query.trim() } } },
              { category: { title: { contains: query.trim() } } },
            ],
          }
        : {}),
    },
    include: productInclude,
  });

  let products = rows.map((row) => mapProduct(row));

  if (minPrice !== undefined) {
    products = products.filter(
      (product) =>
        getDiscountedPrice(product.price, product.discount) >= minPrice,
    );
  }
  if (maxPrice !== undefined) {
    products = products.filter(
      (product) =>
        getDiscountedPrice(product.price, product.discount) <= maxPrice,
    );
  }

  products = sortProducts(products, sort);

  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    products: products.slice(start, start + pageSize),
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
  const result = await getProducts({ query, pageSize: limit, page: 1 });
  return result.products;
}
