"use client";

import { useEffect, useState } from "react";
import type { DeliveryQuote } from "@/lib/delivery";

export function useDeliveryQuote(
  city: string | undefined,
  area: string | undefined,
  subtotal: number,
  fallbackFee: number,
  freeDeliveryAbove = 0,
  phase?: string,
) {
  const [quote, setQuote] = useState<DeliveryQuote | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!city?.trim()) {
      setQuote(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams({
        city: city.trim(),
        area: area?.trim() ?? "",
        subtotal: String(Math.max(0, Math.round(subtotal))),
      });
      if (phase?.trim()) params.set("phase", phase.trim());

      fetch(`/api/delivery/quote?${params}`, { signal: controller.signal })
        .then(async (res) => {
          if (!res.ok) throw new Error("quote failed");
          return res.json() as Promise<DeliveryQuote>;
        })
        .then((data) => setQuote(data))
        .catch(() => {
          if (!controller.signal.aborted) setQuote(null);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 150);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [city, area, phase, subtotal]);

  const fallback =
    freeDeliveryAbove > 0 && subtotal >= freeDeliveryAbove ? 0 : fallbackFee;

  return {
    fee: quote?.fee ?? fallback,
    quote,
    loading,
  };
}
