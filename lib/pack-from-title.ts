/**
 * Parse pack size from imported product titles and clean display names.
 *
 * Examples:
 *   "Acenac Tablets 100Mg (1 Box = 3 Strips) (1 Strip = 10 Tablets)"
 *   "Actim Tablets 2.5Mg (1 Strip = 10 Tablets)"
 *   "Abocal Effervescent Tablets (1 Bottle = 10 Tablets)"
 */

export type ParsedPackFromTitle = {
  cleanName: string;
  sellByStrip: boolean;
  unitsPerStrip: number | null;
  stripsPerBox: number | null;
  /** When true, listed price is per strip (no box packs in title). */
  priceIsPerStrip: boolean;
  dosageForm: string | null;
};

const PACK_PAREN =
  /\s*\(\s*1\s*(?:Box|Strip|Bottle|Pack)\s*=\s*[^)]+\)/gi;

const BOX_STRIPS = /1\s*Box\s*=\s*(\d+)\s*Strips?/i;
const STRIP_UNITS =
  /1\s*Strip\s*=\s*(\d+)\s*(?:Tablets?|Capsules?|Tabs?|Caplets?)/i;

function detectDosageForm(name: string): string | null {
  const n = name.toLowerCase();
  if (/\bcapsules?\b/.test(n)) return "Capsule";
  if (/\btablets?\b|\btabs?\b|\bcaplets?\b/.test(n)) return "Tablet";
  if (/\bsyrup\b/.test(n)) return "Syrup";
  if (/\bsuspension\b/.test(n)) return "Suspension";
  if (/\binjection\b|\binj\b/.test(n)) return "Injection";
  if (/\bcream\b/.test(n)) return "Cream";
  if (/\bointment\b/.test(n)) return "Ointment";
  if (/\bgel\b/.test(n)) return "Gel";
  if (/\bdrops?\b/.test(n)) return "Drops";
  if (/\bsachets?\b/.test(n)) return "Sachet";
  if (/\blotion\b/.test(n)) return "Lotion";
  if (/\binhaler\b/.test(n)) return "Inhaler";
  return null;
}

/** Normalize spacing / strength casing in a cleaned product name. */
export function tidyProductTitle(name: string): string {
  return name
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\b(\d+(?:\.\d+)?)\s*M(G|CG|L|IU)\b/gi, (_, num, unit) => {
      const u = String(unit).toUpperCase();
      if (u === "G") return `${num}mg`;
      if (u === "CG") return `${num}mcg`;
      if (u === "L") return `${num}ml`;
      return `${num}IU`;
    })
    .replace(/\b(\d+(?:\.\d+)?)\s*%/g, "$1%")
    .replace(/\s+\/\s+/g, "/")
    .trim();
}

export function parsePackFromTitle(rawName: string): ParsedPackFromTitle {
  const original = (rawName || "").trim();
  const boxMatch = original.match(BOX_STRIPS);
  const stripMatch = original.match(STRIP_UNITS);

  const stripsPerBox = boxMatch ? Math.max(1, Number(boxMatch[1])) : null;
  const unitsPerStrip = stripMatch ? Math.max(1, Number(stripMatch[1])) : null;

  const sellByStrip = Boolean(unitsPerStrip || stripsPerBox);
  const priceIsPerStrip = Boolean(unitsPerStrip && !stripsPerBox);

  const cleanName = tidyProductTitle(original.replace(PACK_PAREN, " "));

  return {
    cleanName: cleanName || original,
    sellByStrip,
    unitsPerStrip: sellByStrip ? unitsPerStrip ?? 10 : null,
    stripsPerBox: sellByStrip ? stripsPerBox ?? 1 : null,
    priceIsPerStrip,
    dosageForm: detectDosageForm(original),
  };
}

/** Derive strip / box list prices from the imported catalog price. */
export function deriveStripPricing(opts: {
  listPrice: number;
  purchasePrice: number;
  stripsPerBox: number;
  priceIsPerStrip: boolean;
}) {
  const strips = Math.max(1, opts.stripsPerBox);
  const list = Math.max(0, opts.listPrice);
  const purchase = Math.max(0, opts.purchasePrice);

  if (opts.priceIsPerStrip) {
    const stripPrice = Math.round(list * 100) / 100;
    const boxPrice = Math.round(stripPrice * strips * 100) / 100;
    const stripPurchase = Math.round(purchase * 100) / 100;
    const boxPurchase = Math.round(stripPurchase * strips * 100) / 100;
    return {
      price: boxPrice,
      stripPrice,
      purchasePrice: boxPurchase,
      stripPurchasePrice: stripPurchase,
    };
  }

  const stripPrice = Math.round((list / strips) * 100) / 100;
  const stripPurchase = Math.round((purchase / strips) * 100) / 100;
  return {
    price: Math.round(list * 100) / 100,
    stripPrice,
    purchasePrice: Math.round(purchase * 100) / 100,
    stripPurchasePrice: stripPurchase,
  };
}
