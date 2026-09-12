/** Shared helpers for brand/category/product thumbnails when logos are missing. */

const PRODUCT_PLACEHOLDER = "/images/products/placeholder.svg";

export function hasRealCatalogImage(url?: string | null) {
  if (!url) return false;
  return !url.includes("placeholder");
}

export function catalogInitial(title: string) {
  return (title.trim().charAt(0) || "?").toUpperCase();
}

/**
 * Reject unusable / third-party catalog photos.
 * DVAGO CDN images are watermarked and must not be shown on Pharmaco.
 */
export function isUsableProductImage(url?: string | null) {
  if (!url) return false;
  const u = url.toLowerCase();
  if (u.includes("placeholder")) return false;
  if (u.includes("dvago")) return false;
  if (u.includes("noproductfound")) return false;
  return true;
}

export function isDvagoHostedImage(url?: string | null) {
  if (!url) return false;
  return url.toLowerCase().includes("dvago");
}

export function sanitizeProductImages(urls: string[]) {
  const clean = urls.filter(isUsableProductImage);
  return clean.length > 0 ? clean : [PRODUCT_PLACEHOLDER];
}
