import Link from "next/link";
import { ClipboardList } from "lucide-react";

/** Header control placed after Search */
const OrderByPrescriptionButton = () => {
  return (
    <Link
      href="/order-by-prescription"
      className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-shop_orange/35 bg-shop_light_pink/70 px-2.5 text-sm font-semibold text-shop_orange transition-colors hover:border-shop_orange hover:bg-shop_light_pink sm:px-3"
      title="Order by prescription"
    >
      <ClipboardList className="h-4 w-4 shrink-0" aria-hidden />
      <span className="hidden sm:inline lg:hidden">Rx</span>
      <span className="hidden lg:inline">Order by Rx</span>
    </Link>
  );
};

export default OrderByPrescriptionButton;
