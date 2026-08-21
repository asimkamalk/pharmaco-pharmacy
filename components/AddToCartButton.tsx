"use client";

import { Minus, Plus, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { useIsHydrated } from "@/hooks";
import type { Product } from "@/types";

interface AddToCartButtonProps {
  product: Product;
  className?: string;
}

const AddToCartButton = ({ product, className }: AddToCartButtonProps) => {
  const isHydrated = useIsHydrated();
  const addItem = useCart((state) => state.addItem);
  const setQuantity = useCart((state) => state.setQuantity);
  const removeItem = useCart((state) => state.removeItem);
  const cartItem = useCart((state) =>
    state.items.find((item) => item.product.id === product.id),
  );

  const quantity = isHydrated ? (cartItem?.quantity ?? 0) : 0;
  const outOfStock = product.stock <= 0;

  const handleDecrease = () => {
    if (quantity <= 1) {
      removeItem(product.id);
    } else {
      setQuantity(product.id, quantity - 1);
    }
  };

  if (quantity > 0) {
    return (
      <div
        className={cn(
          "flex h-9 items-center justify-between rounded-lg border border-shop_btn_dark_green/20 bg-shop_light_bg",
          className,
        )}
      >
        <button
          onClick={handleDecrease}
          aria-label={`Decrease quantity of ${product.name}`}
          className="flex h-full w-9 items-center justify-center rounded-l-lg transition-colors duration-200 hover:bg-shop_light_pink"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span
          aria-live="polite"
          className="text-sm font-semibold text-darkColor"
        >
          {quantity}
        </span>
        <button
          onClick={() => setQuantity(product.id, quantity + 1)}
          disabled={quantity >= product.stock}
          aria-label={`Increase quantity of ${product.name}`}
          className="flex h-full w-9 items-center justify-center rounded-r-lg transition-colors duration-200 hover:bg-shop_light_pink disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => addItem(product)}
      disabled={outOfStock}
      aria-label={
        outOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`
      }
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-shop_btn_dark_green px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-shop_dark_green/90 disabled:cursor-not-allowed disabled:bg-lightColor/30 disabled:text-lightColor",
        className,
      )}
    >
      <ShoppingBag className="h-4 w-4" />
      {outOfStock ? "Out of Stock" : "Add to Cart"}
    </button>
  );
};

export default AddToCartButton;
