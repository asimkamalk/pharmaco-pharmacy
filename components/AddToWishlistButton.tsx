"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/hooks/useWishlist";
import { useIsHydrated } from "@/hooks";
import type { Product } from "@/types";

interface AddToWishlistButtonProps {
  product: Product;
  className?: string;
}

const AddToWishlistButton = ({
  product,
  className,
}: AddToWishlistButtonProps) => {
  const isHydrated = useIsHydrated();
  const toggleItem = useWishlist((state) => state.toggleItem);
  const inWishlist = useWishlist((state) =>
    state.items.some((item) => item.id === product.id),
  );
  const isActive = isHydrated && inWishlist;

  return (
    <button
      onClick={() => toggleItem(product)}
      aria-label={
        isActive
          ? `Remove ${product.name} from wishlist`
          : `Add ${product.name} to wishlist`
      }
      aria-pressed={isActive}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition-colors duration-200 hover:border-shop_light_green",
        className,
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors duration-200",
          isActive
            ? "fill-shop_orange text-shop_orange"
            : "text-lightColor hover:text-shop_light_green",
        )}
      />
    </button>
  );
};

export default AddToWishlistButton;
