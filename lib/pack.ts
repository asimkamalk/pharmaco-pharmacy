import { getDiscountedPrice } from "@/lib/utils";
import type { PackType } from "@/types";

export type PackProduct = {
  sellByStrip?: boolean | null;
  price: number;
  stripPrice?: number | null;
  discount: number;
  stock: number;
  stripsPerBox?: number | null;
  purchasePrice?: number | null;
  stripPurchasePrice?: number | null;
  unitsPerStrip?: number | null;
  dosageForm?: string | null;
};

export function normalizePackType(
  packType: string | undefined | null,
  soldAsStrip?: boolean,
): PackType {
  if (packType === "box" || packType === "strip" || packType === "unit") {
    return packType;
  }
  if (soldAsStrip) return "strip";
  return "unit";
}

export function cartLineKey(productId: string, packType: PackType) {
  return `${productId}:${packType}`;
}

export function resolvePackType(
  product: { sellByStrip?: boolean },
  requested?: PackType,
): PackType {
  if (!product.sellByStrip) return "unit";
  if (requested === "strip" || requested === "box") return requested;
  return "box";
}

export function stripsPerBoxOf(product: { stripsPerBox?: number | null }) {
  return Math.max(1, product.stripsPerBox ?? 1);
}

/** True when the catalog "box" is a single strip (box price === strip price). */
export function isSingleStripBox(product: {
  sellByStrip?: boolean | null;
  stripsPerBox?: number | null;
}) {
  return Boolean(product.sellByStrip) && stripsPerBoxOf(product) === 1;
}

/** How many inventory strips this cart/order line consumes */
export function stockUnitsForLine(
  product: PackProduct,
  packType: PackType,
  quantity: number,
) {
  if (!product.sellByStrip || packType === "unit") return quantity;
  if (packType === "box") return quantity * stripsPerBoxOf(product);
  return quantity;
}

/** Max orderable packs given strip inventory */
export function maxPackQuantity(product: PackProduct, packType: PackType) {
  if (product.stock <= 0) return 0;
  if (!product.sellByStrip || packType === "unit") return product.stock;
  if (packType === "box") {
    return Math.floor(product.stock / stripsPerBoxOf(product));
  }
  return product.stock;
}

export function listPriceForPack(product: PackProduct, packType: PackType) {
  if (packType === "strip") {
    return product.stripPrice ?? 0;
  }
  return product.price;
}

export function unitPriceForPack(product: PackProduct, packType: PackType) {
  return getDiscountedPrice(
    listPriceForPack(product, packType),
    product.discount,
  );
}

export function purchasePriceForPack(
  product: PackProduct,
  packType: PackType,
) {
  if (packType === "strip") {
    if (
      product.stripPurchasePrice != null &&
      product.stripPurchasePrice >= 0
    ) {
      return product.stripPurchasePrice;
    }
    const perBox = product.purchasePrice ?? 0;
    return Math.round((perBox / stripsPerBoxOf(product)) * 100) / 100;
  }
  return product.purchasePrice ?? 0;
}

export function packLabel(packType: PackType, count = 1) {
  if (packType === "box") return count === 1 ? "box" : "boxes";
  if (packType === "strip") return count === 1 ? "strip" : "strips";
  return count === 1 ? "item" : "items";
}

export function formatPackOrderLabel(opts: {
  packType: PackType;
  quantity: number;
  unitsPerStrip?: number;
  stripsPerBox?: number;
  dosageForm?: string;
}) {
  const { packType, quantity } = opts;
  const unit = packLabel(packType, quantity);
  if (packType === "box") {
    const strips = opts.stripsPerBox;
    return strips && strips > 0
      ? `${quantity} ${unit} (${strips} strips each)`
      : `${quantity} ${unit}`;
  }
  if (packType === "strip") {
    const units = opts.unitsPerStrip;
    return units && units > 0
      ? `${quantity} ${unit} (${units} each)`
      : `${quantity} ${unit}`;
  }
  return `Qty ${quantity}`;
}
