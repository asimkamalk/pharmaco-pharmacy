import Link from "next/link";
import { Package } from "lucide-react";

/** Header control shown only when the user is signed in */
const MyOrdersButton = () => {
  return (
    <Link
      href="/account/orders"
      className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-shop_dark_green/25 bg-shop_light_green/10 px-2.5 text-sm font-semibold text-shop_dark_green transition-colors hover:border-shop_dark_green/40 hover:bg-shop_light_green/20 sm:px-3"
      title="My Orders"
    >
      <Package className="h-4 w-4 shrink-0" aria-hidden />
      <span className="hidden sm:inline">My Orders</span>
    </Link>
  );
};

export default MyOrdersButton;
