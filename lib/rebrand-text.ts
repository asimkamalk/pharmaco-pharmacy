/**
 * Replace source-catalog / competitor branding in customer-facing copy.
 * Keep URL detection filters (catalog-image) separate — those match asset hosts.
 */

const REPLACEMENTS: Array<{ pattern: RegExp; with: string }> = [
  // Prefer longer / more specific patterns first
  { pattern: /\bDVAGO\b/g, with: "PHARMACO" },
  { pattern: /\bDvago\b/g, with: "Pharmaco" },
  { pattern: /\bdvago\b/gi, with: "pharmaco" },
  // SKU-style prefixes (dvago-123 → pharmaco-123)
  { pattern: /\bdvago(?=-)/gi, with: "pharmaco" },
];

/** Rewrite free-text fields (descriptions, meta, HTML). */
export function rebrandCatalogText(value?: string | null): string {
  if (!value) return value ?? "";
  let out = value;
  for (const { pattern, with: replacement } of REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

/** Rewrite SKU prefixes from the import source brand. */
export function rebrandSku(sku?: string | null): string {
  if (!sku) return sku ?? "";
  return sku.replace(/^dvago(?=-)/i, "pharmaco");
}
