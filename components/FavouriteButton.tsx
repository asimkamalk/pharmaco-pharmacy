"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useWishlist } from "@/hooks/useWishlist";
import { useIsHydrated } from "@/hooks";

const FavouriteButton = () => {
  const isHydrated = useIsHydrated();
  const totalItems = useWishlist((state) => state.items.length);
  const count = isHydrated ? totalItems : 0;

  return (
    <Link
      href="/wishlist"
      aria-label={`Wishlist, ${count} item${count === 1 ? "" : "s"}`}
      className="group relative inline-flex items-center justify-center"
    >
      <Heart className="h-5 w-5 transition-colors duration-200 group-hover:text-shop_light_green" />

      <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-shop_btn_dark_green text-[10px] font-semibold leading-none text-white">
        {count > 9 ? "9+" : count}
      </span>
    </Link>
  );
};

export default FavouriteButton;
