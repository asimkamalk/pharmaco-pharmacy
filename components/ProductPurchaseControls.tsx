"use client";

import { useState } from "react";
import { Minus, Package, Plus, ShoppingBag } from "lucide-react";
import { useIsHydrated } from "@/hooks";
import { useCart } from "@/hooks/useCart";
import {
  maxPackQuantity,
  packLabel,
  resolvePackType,
  unitPriceForPack,
} from "@/lib/pack";
import {
  cn,
  formatPrice,
  formatStripAvailability,
  formatStripHint,
} from "@/lib/utils";
import type { PackType, Product } from "@/types";

interface ProductPurchaseControlsProps {
  product: Product;
  layout?: "card" | "detail" | "compact";
  className?: string;
  /** For compact/cart — which pack line this control manages */
  packType?: PackType;
}

const ProductPurchaseControls = ({
  product,
  layout = "card",
  className,
  packType: packTypeProp,
}: ProductPurchaseControlsProps) => {
  const isHydrated = useIsHydrated();
  const addItem = useCart((state) => state.addItem);
  const setQuantity = useCart((state) => state.setQuantity);
  const removeItem = useCart((state) => state.removeItem);

  const sellByStrip = Boolean(product.sellByStrip);
  const compactPack = resolvePackType(product, packTypeProp);

  const boxInCart = useCart((state) =>
    state.items.find(
      (item) =>
        item.product.id === product.id && (item.packType ?? "unit") === "box",
    ),
  );
  const stripInCart = useCart((state) =>
    state.items.find(
      (item) =>
        item.product.id === product.id && (item.packType ?? "unit") === "strip",
    ),
  );
  const unitInCart = useCart((state) =>
    state.items.find(
      (item) =>
        item.product.id === product.id && (item.packType ?? "unit") === "unit",
    ),
  );
  const compactInCart = useCart((state) =>
    state.items.find(
      (item) =>
        item.product.id === product.id &&
        (item.packType ?? "unit") === compactPack,
    ),
  );

  const boxQty = isHydrated ? (boxInCart?.quantity ?? 0) : 0;
  const stripQty = isHydrated ? (stripInCart?.quantity ?? 0) : 0;
  const unitQty = isHydrated ? (unitInCart?.quantity ?? 0) : 0;
  const compactQty = isHydrated ? (compactInCart?.quantity ?? 0) : 0;

  const outOfStock = product.stock <= 0;
  const maxBoxes = maxPackQuantity(product, "box");
  const maxStrips = maxPackQuantity(product, "strip");
  const stripAvailability = formatStripAvailability(product);
  const stripHint = formatStripHint(product);

  const [pendingBoxes, setPendingBoxes] = useState(1);

  const clamp = (value: number, max: number) =>
    Math.min(Math.max(1, value), Math.max(1, max));

  const stepper = (
    qty: number,
    pack: PackType,
    wide?: boolean,
    widthClass?: string,
  ) => (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border border-shop_btn_dark_green/20 bg-shop_light_bg",
        wide ? "h-11" : "h-9",
        widthClass ?? "w-full",
      )}
    >
      <button
        type="button"
        onClick={() => {
          if (qty <= 1) removeItem(product.id, pack);
          else setQuantity(product.id, qty - 1, pack);
        }}
        aria-label={`Decrease ${packLabel(pack, 1)}`}
        className={cn(
          "flex h-full items-center justify-center rounded-l-lg hover:bg-shop_light_pink",
          wide ? "w-10" : "w-9",
        )}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="px-1 text-sm font-semibold text-darkColor">
        {qty}
        <span className="ml-1 text-[10px] font-medium uppercase text-lightColor">
          {packLabel(pack, qty)}
        </span>
      </span>
      <button
        type="button"
        onClick={() => setQuantity(product.id, qty + 1, pack)}
        disabled={qty >= maxPackQuantity(product, pack)}
        aria-label={`Increase ${packLabel(pack, 1)}`}
        className={cn(
          "flex h-full items-center justify-center rounded-r-lg hover:bg-shop_light_pink disabled:opacity-40",
          wide ? "w-10" : "w-9",
        )}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  /* —— Cart compact —— */
  if (layout === "compact") {
    if (compactQty > 0) {
      return (
        <div className={cn(className)}>
          {stepper(compactQty, compactPack, false, "w-full")}
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={() => addItem(product, 1, compactPack)}
        disabled={outOfStock || maxPackQuantity(product, compactPack) <= 0}
        className={cn(
          "inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-shop_btn_dark_green px-4 text-sm font-semibold text-white hover:bg-shop_dark_green/90 disabled:bg-lightColor/30 disabled:text-lightColor",
          className,
        )}
      >
        <ShoppingBag className="h-4 w-4" />
        {outOfStock
          ? "Out of Stock"
          : compactPack === "strip"
            ? "Add 1 strip"
            : compactPack === "box"
              ? "Add 1 box"
              : "Add to Cart"}
      </button>
    );
  }

  /* —— Normal product (no strip mode) —— */
  if (!sellByStrip) {
    if (unitQty > 0) {
      return <div className={cn(className)}>{stepper(unitQty, "unit")}</div>;
    }
    return (
      <div className={cn(className)}>
        <button
          type="button"
          onClick={() => addItem(product, 1, "unit")}
          disabled={outOfStock}
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-shop_btn_dark_green px-4 text-sm font-semibold text-white hover:bg-shop_dark_green/90 disabled:bg-lightColor/30 disabled:text-lightColor",
            layout === "detail" ? "h-11 sm:w-56" : "h-9",
          )}
        >
          <ShoppingBag className="h-4 w-4" />
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    );
  }

  const boxPrice = unitPriceForPack(product, "box");
  const stripPrice = unitPriceForPack(product, "strip");

  /* —— Detail (box + strip) —— */
  if (layout === "detail") {
    return (
      <div className={cn("space-y-4", className)}>
        {stripAvailability ? (
          <div className="flex items-start gap-3 rounded-lg border border-shop_light_green/35 bg-shop_light_bg/80 p-4">
            <Package
              className="mt-0.5 h-5 w-5 shrink-0 text-shop_dark_green"
              aria-hidden
            />
            <div className="text-sm">
              <p className="font-semibold text-darkColor">Box or single strip</p>
              <p className="mt-0.5 text-lightColor">{stripAvailability}</p>
              <p className="mt-2 text-xs text-darkColor">
                Box {formatPrice(boxPrice)}
                {product.stripsPerBox
                  ? ` · ${product.stripsPerBox} strips`
                  : ""}
                {" · "}
                Strip {formatPrice(stripPrice)}
              </p>
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-darkColor">
              Complete box
              {product.stripsPerBox
                ? ` (${product.stripsPerBox} strips)`
                : ""}
            </p>
            {boxQty > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                {stepper(boxQty, "box", true, "max-w-[14rem]")}
                <button
                  type="button"
                  onClick={() => addItem(product, 1, "box")}
                  disabled={boxQty >= maxBoxes}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-shop_btn_dark_green/35 bg-white px-4 text-sm font-semibold text-shop_dark_green hover:bg-shop_light_bg disabled:opacity-40"
                >
                  Add 1 box
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex h-11 w-full max-w-[14rem] items-center justify-between rounded-lg border border-shop_btn_dark_green/20 bg-shop_light_bg">
                  <button
                    type="button"
                    onClick={() =>
                      setPendingBoxes((q) => clamp(q - 1, maxBoxes || 1))
                    }
                    disabled={pendingBoxes <= 1 || maxBoxes <= 0}
                    className="flex h-full w-10 items-center justify-center rounded-l-lg hover:bg-shop_light_pink disabled:opacity-40"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-sm font-semibold">
                    {pendingBoxes}{" "}
                    <span className="text-[10px] uppercase text-lightColor">
                      {packLabel("box", pendingBoxes)}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPendingBoxes((q) => clamp(q + 1, maxBoxes || 1))
                    }
                    disabled={pendingBoxes >= maxBoxes || maxBoxes <= 0}
                    className="flex h-full w-10 items-center justify-center rounded-r-lg hover:bg-shop_light_pink disabled:opacity-40"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    addItem(product, pendingBoxes, "box");
                    setPendingBoxes(1);
                  }}
                  disabled={maxBoxes <= 0}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-shop_btn_dark_green px-4 text-sm font-semibold text-white hover:bg-shop_dark_green/90 disabled:bg-lightColor/30 disabled:text-lightColor sm:max-w-xs"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {maxBoxes <= 0
                    ? "Out of Stock"
                    : pendingBoxes === 1
                      ? "Add to cart (box)"
                      : `Add ${pendingBoxes} boxes`}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-black/10 pt-3">
            <p className="text-sm font-medium text-darkColor">
              Single strip
              {product.unitsPerStrip
                ? ` · ${product.unitsPerStrip} ${product.dosageForm?.toLowerCase().includes("capsule") ? "capsules" : "tablets"}`
                : ""}
            </p>
            {stripQty > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                {stepper(stripQty, "strip", true, "max-w-[14rem]")}
                <button
                  type="button"
                  onClick={() => addItem(product, 1, "strip")}
                  disabled={stripQty >= maxStrips}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-shop_btn_dark_green/35 bg-white px-4 text-sm font-semibold text-shop_dark_green hover:bg-shop_light_bg disabled:opacity-40"
                >
                  Add 1 strip
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => addItem(product, 1, "strip")}
                disabled={maxStrips <= 0}
                className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-shop_btn_dark_green/35 bg-white px-4 text-sm font-semibold text-shop_dark_green hover:bg-shop_light_bg disabled:opacity-40 sm:w-auto"
              >
                Add 1 strip · {formatPrice(stripPrice)}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* —— Card —— */
  return (
    <div className={cn("space-y-2.5", className)}>
      {stripHint ? (
        <p className="text-[11px] leading-snug text-lightColor">{stripHint}</p>
      ) : null}

      {(boxQty > 0 || stripQty > 0) && (
        <div className="space-y-1.5">
          {boxQty > 0 ? stepper(boxQty, "box") : null}
          {stripQty > 0 ? stepper(stripQty, "strip") : null}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => addItem(product, 1, "box")}
          disabled={maxBoxes <= 0}
          className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-shop_btn_dark_green px-3 text-sm font-semibold whitespace-nowrap text-white hover:bg-shop_dark_green/90 disabled:bg-lightColor/30 disabled:text-lightColor"
        >
          <ShoppingBag className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {maxBoxes <= 0 ? "Out of stock" : "Add box"}
        </button>
        <button
          type="button"
          onClick={() => addItem(product, 1, "strip")}
          disabled={maxStrips <= 0}
          className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-shop_btn_dark_green/35 bg-white px-3 text-sm font-semibold whitespace-nowrap text-shop_dark_green hover:bg-shop_light_bg disabled:opacity-40"
        >
          {maxStrips <= 0 ? "No strips" : "Add 1 strip"}
        </button>
      </div>
    </div>
  );
};

export default ProductPurchaseControls;
