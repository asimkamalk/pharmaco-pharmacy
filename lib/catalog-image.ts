/** Shared helpers for brand/category/product thumbnails when logos are missing. */

const PRODUCT_PLACEHOLDER = "/images/products/placeholder.svg";

export function hasRealCatalogImage(url?: string | null) {
  if (!url) return false;
  return !url.includes("placeholder");
}

export function catalogInitial(title: string) {
  return (title.trim().charAt(0) || "?").toUpperCase();
}

/** Reject DVAGO site logos / empty assets that were imported as product photos. */
export function isUsableProductImage(url?: string | null) {
  if (!url) return false;
  const u = url.toLowerCase();
  if (u.includes("placeholder")) return false;
  if (u.includes("dvago-logo")) return false;
  if (u.includes("noproductfound")) return false;
  if (u.includes("www.dvago.pk/assets/")) return false;
  if (u.includes("/assets/dvago")) return false;
  return true;
}

export function sanitizeProductImages(urls: string[]) {
  const clean = urls.filter(isUsableProductImage);
  return clean.length > 0 ? clean : [PRODUCT_PLACEHOLDER];
}
