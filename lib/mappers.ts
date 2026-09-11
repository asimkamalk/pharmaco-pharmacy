import type { Brand, Category, Product } from "@/types";
import { sanitizeProductImages } from "@/lib/catalog-image";
import { rebrandCatalogText, rebrandSku } from "@/lib/rebrand-text";

type DbCategory = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
};

type DbBrand = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
};

type DbProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  metaDescription?: string;
  metaTitle?: string;
  sku: string;
  purchasePrice: number;
  price: number;
  discount: number;
  stock: number;
  requiresPrescription: boolean;
  sellByStrip: boolean;
  unitsPerStrip: number | null;
  stripsPerBox: number | null;
  stripPrice: number | null;
  stripPurchasePrice: number | null;
  isFeatured: boolean;
  isArchived: boolean;
  rating: number | null;
  reviewCount: number;
  genericName: string | null;
  strength: string | null;
  dosageForm: string | null;
  manufacturer: string | null;
  createdAt: Date;
  category: { slug: string; title: string };
  brand: { slug: string; title: string };
  images: { url: string; sortOrder: number }[];
};

export function mapCategory(category: DbCategory): Category {
  return {
    id: category.id,
    title: category.title,
    slug: category.slug,
    description: rebrandCatalogText(category.description),
    image: category.image,
  };
}

export function mapBrand(brand: DbBrand): Brand {
  return {
    id: brand.id,
    title: brand.title,
    slug: brand.slug,
    description: rebrandCatalogText(brand.description),
    image: brand.image,
  };
}

export function mapProduct(
  product: DbProduct,
  options?: { includeCost?: boolean },
): Product {
  const images = sanitizeProductImages(
    [...product.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => image.url),
  );

  return {
    id: product.id,
    name: rebrandCatalogText(product.name),
    slug: product.slug,
    description: rebrandCatalogText(product.description),
    longDescription: product.longDescription
      ? rebrandCatalogText(product.longDescription)
      : undefined,
    metaDescription: product.metaDescription
      ? rebrandCatalogText(product.metaDescription)
      : undefined,
    metaTitle: product.metaTitle
      ? rebrandCatalogText(product.metaTitle)
      : undefined,
    categorySlug: product.category.slug,
    categoryTitle: product.category.title,
    brandSlug: product.brand.slug,
    brandTitle: product.brand.title,
    price: product.price,
    purchasePrice: options?.includeCost ? product.purchasePrice : undefined,
    discount: product.discount,
    stock: product.stock,
    sku: rebrandSku(product.sku),
    images,
    requiresPrescription: product.requiresPrescription,
    sellByStrip: product.sellByStrip,
    unitsPerStrip: product.unitsPerStrip ?? undefined,
    stripsPerBox: product.stripsPerBox ?? undefined,
    stripPrice: product.stripPrice ?? undefined,
    stripPurchasePrice: options?.includeCost
      ? (product.stripPurchasePrice ?? undefined)
      : undefined,
    isFeatured: product.isFeatured,
    isArchived: product.isArchived,
    rating: product.rating ?? undefined,
    reviewCount: product.reviewCount,
    genericName: product.genericName ?? undefined,
    strength: product.strength ?? undefined,
    dosageForm: product.dosageForm ?? undefined,
    manufacturer: product.manufacturer ?? undefined,
    createdAt: product.createdAt.toISOString(),
  };
}
