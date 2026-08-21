"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useIsHydrated } from "@/hooks";
import { cn } from "@/lib/utils";

const OPEN_SEARCH_EVENT = "pharmaco:open-search";

export function openSearchDialog() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));
  }
}

export { OPEN_SEARCH_EVENT };

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-shop_btn_dark_green px-1 text-[10px] font-semibold leading-none text-white">
      {count > 9 ? "9+" : count}
    </span>
  );
}

const MobileBottomNav = () => {
  const pathname = usePathname();
  const isHydrated = useIsHydrated();
  const cartCount = useCart((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );
  const wishlistCount = useWishlist((state) => state.items.length);

  const items = [
    {
      key: "shop",
      label: "Shop",
      href: "/shop",
      icon: ShoppingBag,
      active: pathname === "/shop" || pathname.startsWith("/product"),
    },
    {
      key: "search",
      label: "Search",
      href: null as string | null,
      icon: Search,
      active: false,
    },
    {
      key: "cart",
      label: "Cart",
      href: "/cart",
      icon: ShoppingCart,
      active: pathname === "/cart" || pathname.startsWith("/checkout"),
      badge: isHydrated ? cartCount : 0,
    },
    {
      key: "wishlist",
      label: "Wishlist",
      href: "/wishlist",
      icon: Star,
      active: pathname === "/wishlist",
      badge: isHydrated ? wishlistCount : 0,
    },
  ] as const;

  const itemClass = (active: boolean) =>
    cn(
      "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold tracking-wide transition-colors",
      active
        ? "text-shop_dark_green"
        : "text-darkColor hover:text-shop_light_green",
    );

  return (
    <nav
      aria-label="Mobile shortcuts"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-lg divide-x divide-black/10">
        {items.map((item) => {
          const Icon = item.icon;
          if (item.href === null) {
            return (
              <button
                key={item.key}
                type="button"
                onClick={openSearchDialog}
                className={itemClass(false)}
                aria-label="Search products"
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.key}
              href={item.href}
              className={itemClass(item.active)}
              aria-current={item.active ? "page" : undefined}
              aria-label={
                "badge" in item && item.badge
                  ? `${item.label}, ${item.badge}`
                  : item.label
              }
            >
              <span className="relative inline-flex">
                <Icon
                  className="h-5 w-5"
                  strokeWidth={1.75}
                  fill={
                    item.key === "wishlist" && item.active
                      ? "currentColor"
                      : "none"
                  }
                />
                {"badge" in item && item.badge !== undefined ? (
                  <NavBadge count={item.badge} />
                ) : null}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
