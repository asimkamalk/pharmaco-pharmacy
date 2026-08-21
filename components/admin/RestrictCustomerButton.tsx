"use client";

import { useTransition } from "react";
import { Ban, ShieldCheck } from "lucide-react";
import { setCustomerRestricted } from "@/lib/actions/admin";
import { cn } from "@/lib/utils";

interface RestrictCustomerButtonProps {
  customerId: string;
  customerName: string;
  isRestricted: boolean;
  className?: string;
}

const RestrictCustomerButton = ({
  customerId,
  customerName,
  isRestricted,
  className,
}: RestrictCustomerButtonProps) => {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const ok = window.confirm(
          isRestricted
            ? `Allow “${customerName}” to sign in again?`
            : `Restrict “${customerName}”? They will not be able to sign in.`,
        );
        if (!ok) return;
        const formData = new FormData();
        formData.set("customerId", customerId);
        formData.set("restricted", isRestricted ? "false" : "true");
        startTransition(() => {
          void setCustomerRestricted(formData);
        });
      }}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium transition-colors disabled:opacity-60",
        isRestricted
          ? "text-shop_dark_green hover:text-shop_light_green"
          : "text-shop_orange hover:text-shop_orange/80",
        className,
      )}
    >
      {isRestricted ? (
        <ShieldCheck className="h-3.5 w-3.5" />
      ) : (
        <Ban className="h-3.5 w-3.5" />
      )}
      {pending
        ? "Saving…"
        : isRestricted
          ? "Unrestrict"
          : "Restrict"}
    </button>
  );
};

export default RestrictCustomerButton;
