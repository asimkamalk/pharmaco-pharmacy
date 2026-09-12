import Link from "next/link";
import { ClipboardList } from "lucide-react";

/** Header control placed after Search */
const OrderByPrescriptionButton = () => {
  return (
    <Link
      href="/order-by-prescription"
      className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-shop_btn_dark_green px-2.5 text-sm font-bold text-white shadow-[0_8px_18px_-10px_rgba(220,38,38,0.8)] transition-colors hover:bg-shop_leaf sm:px-3.5"
      title="Order by prescription"
    >
      <ClipboardList className="h-4 w-4 shrink-0" aria-hidden />
      <span className="hidden sm:inline lg:hidden">Rx</span>
      <span className="hidden lg:inline">Order by Rx</span>
    </Link>
  );
};

export default OrderByPrescriptionButton;
