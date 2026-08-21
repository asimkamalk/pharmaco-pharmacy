"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

type ReorderLine = {
  productId: string;
  quantity: number;
};

interface ReorderButtonProps {
  items: ReorderLine[];
  className?: string;
  /** Compact style for list cards */
  variant?: "primary" | "ghost";
}

const ReorderButton = ({
  items,
  className,
  variant = "primary",
}: ReorderButtonProps) => {
  const router = useRouter();
  const addItem = useCart((state) => state.addItem);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const handleReorder = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setMessage("");

    const lines = items.filter((item) => item.productId && item.quantity > 0);
    if (!lines.length) {
      setMessage("No products available to reorder");
      return;
    }

    setBusy(true);
    try {
      const ids = [...new Set(lines.map((line) => line.productId))];
      const res = await fetch(
        `/api/products/by-ids?ids=${encodeURIComponent(ids.join(","))}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error("Could not load products");
      const data = (await res.json()) as { products: Product[] };
      const productMap = Object.fromEntries(
        (data.products ?? []).map((product) => [product.id, product]),
      );

      let added = 0;
      let skipped = 0;
      for (const line of lines) {
        const product = productMap[line.productId];
        if (!product || product.stock <= 0) {
          skipped += 1;
          continue;
        }
        addItem(product, line.quantity);
        added += 1;
      }

      if (added === 0) {
        setMessage(
          skipped
            ? "Those products are out of stock or no longer available"
            : "Nothing to reorder",
        );
        return;
      }

      router.push("/cart");
    } catch {
      setMessage("Could not reorder right now. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn("inline-flex flex-col items-stretch gap-1", className)}>
      <button
        type="button"
        disabled={busy || items.length === 0}
        onClick={handleReorder}
        className={cn(
          "inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-semibold transition-colors disabled:opacity-60",
          variant === "primary"
            ? "bg-shop_btn_dark_green text-white hover:bg-shop_dark_green/90"
            : "border border-black/15 bg-white text-darkColor hover:border-shop_light_green hover:text-shop_dark_green",
        )}
      >
        <RotateCcw className={cn("h-4 w-4", busy && "animate-spin")} />
        {busy ? "Adding…" : "Reorder"}
      </button>
      {message && (
        <p className="max-w-[14rem] text-xs text-shop_orange">{message}</p>
      )}
    </div>
  );
};

export default ReorderButton;
