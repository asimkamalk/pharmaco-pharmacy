import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { stripsPerBoxOf } from "@/lib/pack";
import type { Product } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return `Rs. ${new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

/** Final selling price after applying the product's discount percentage. */
export function getDiscountedPrice(price: number, discount: number): number {
  if (!discount || discount <= 0) return price;
  return Math.round(price - (price * discount) / 100);
}

/** "tablet(s)" / "capsule(s)" from dosage form */
export function stripContentNoun(
  product: { dosageForm?: string },
  count = 1,
): string {
  const form = (product.dosageForm || "tablet").toLowerCase();
  if (form.includes("capsule")) {
    return count === 1 ? "capsule" : "capsules";
  }
  if (form.includes("tablet") || !product.dosageForm) {
    return count === 1 ? "tablet" : "tablets";
  }
  return count === 1 ? "unit" : "units";
}

export function formatStripHint(product: {
  sellByStrip?: boolean;
  unitsPerStrip?: number;
  stripsPerBox?: number;
  dosageForm?: string;
}): string | null {
  if (!product.sellByStrip) return null;
  const units = product.unitsPerStrip;
  const strips = product.stripsPerBox;
  const unitPart =
    units && units > 0
      ? `${units} ${stripContentNoun(product, units)} per strip`
      : null;
  const boxPart =
    strips && strips > 0 ? `${strips} strips per box` : null;
  if (unitPart && boxPart) return `${unitPart} · ${boxPart}`;
  return unitPart || boxPart || "Available as box or strip";
}

/** Longer storefront copy for PDP / callouts */
export function formatStripAvailability(product: {
  sellByStrip?: boolean;
  unitsPerStrip?: number;
  stripsPerBox?: number;
  dosageForm?: string;
}): string | null {
  if (!product.sellByStrip) return null;
  const units = product.unitsPerStrip;
  const strips = stripsPerBoxOf(product);
  const unitText =
    units && units > 0
      ? `Each strip contains ${units} ${stripContentNoun(product, units)}.`
      : "";
  return `Buy a complete box (${strips} strip${strips === 1 ? "" : "s"}) or a single strip. ${unitText}`.trim();
}

/** @deprecated prefer packLabel from lib/pack */
export function sellUnitLabel(
  product: { sellByStrip?: boolean },
  count = 1,
): string {
  if (!product.sellByStrip) return count === 1 ? "item" : "items";
  return count === 1 ? "strip" : "strips";
}
