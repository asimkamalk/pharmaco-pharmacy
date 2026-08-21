"use client";

import { Heart, Trash2 } from "lucide-react";
import Container from "./Container";
import EmptyState from "./EmptyState";
import ProductCard from "./ProductCard";
import { useWishlist } from "@/hooks/useWishlist";
import { useIsHydrated } from "@/hooks";

const WishlistView = () => {
  const isHydrated = useIsHydrated();
  const items = useWishlist((state) => state.items);
  const clearWishlist = useWishlist((state) => state.clearWishlist);

  if (!isHydrated) {
    return (
      <Container className="py-8 sm:py-10">
        <div className="h-8 w-40 animate-pulse rounded bg-shop_light_bg" />
        <div className="mt-6 h-64 animate-pulse rounded-xl bg-shop_light_bg/60" />
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="py-8 sm:py-10">
        <h1 className="mb-6 text-2xl font-bold text-darkColor sm:text-3xl">
          My Wishlist
        </h1>
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Tap the heart icon on any product to save it here for later."
          actionLabel="Browse Products"
          actionHref="/shop"
        />
      </Container>
    );
  }

  return (
    <Container className="py-8 sm:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-darkColor sm:text-3xl">
          My Wishlist{" "}
          <span className="text-base font-normal text-lightColor">
            ({items.length} item{items.length === 1 ? "" : "s"})
          </span>
        </h1>
        <button
          onClick={clearWishlist}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-shop_orange transition-colors duration-200 hover:text-shop_orange/80"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Clear Wishlist
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </Container>
  );
};

export default WishlistView;
