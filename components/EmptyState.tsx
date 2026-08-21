import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-black/15 bg-shop_light_bg/50 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-shop_light_pink">
        <Icon className="h-6 w-6 text-shop_dark_green" aria-hidden />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-darkColor">{title}</h2>
      <p className="mt-1.5 max-w-md text-sm text-lightColor">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-shop_btn_dark_green px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-shop_dark_green/90"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
