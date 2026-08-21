"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import SalesChart from "@/components/admin/SalesChart";
import { toPkDateKey } from "@/lib/datetime";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

const PRESETS = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "3m", label: "3 months" },
  { id: "6m", label: "6 months" },
  { id: "1y", label: "1 year" },
] as const;

interface SalesOverviewProps {
  data: { date: string; revenue: number; profit: number; orders: number }[];
  rangeLabel: string;
  rangePreset: string;
  rangeFrom: string;
  rangeTo: string;
  rangeRevenue: number;
  rangeProfit: number;
  categoryCount: number;
  brandCount: number;
  seriesGranularity?: "hour" | "day";
}

const SalesOverview = ({
  data,
  rangeLabel,
  rangePreset,
  rangeFrom,
  rangeTo,
  rangeRevenue,
  rangeProfit,
  categoryCount,
  brandCount,
  seriesGranularity = "day",
}: SalesOverviewProps) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [customFrom, setCustomFrom] = useState(rangeFrom);
  const [customTo, setCustomTo] = useState(rangeTo);
  const isCustom = rangePreset === "custom";

  const applyPreset = (preset: string) => {
    startTransition(() => {
      router.push(`/admin?range=${preset}`);
    });
  };

  const applyCustom = () => {
    if (!customFrom || !customTo) return;
    if (customFrom > customTo) return;
    startTransition(() => {
      router.push(
        `/admin?range=custom&from=${encodeURIComponent(customFrom)}&to=${encodeURIComponent(customTo)}`,
      );
    });
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-black/10 bg-white p-5 shadow-sm",
        pending && "opacity-70",
      )}
    >
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-darkColor">
            Sales ({rangeLabel.toLowerCase()})
          </h2>
          <p className="text-xs text-lightColor">
            Green = revenue · Orange = estimated profit · Pakistan time (PKT)
          </p>
          <p className="mt-2 text-sm text-darkColor">
            <span className="font-semibold text-shop_dark_green">
              {formatPrice(rangeRevenue)}
            </span>
            <span className="text-lightColor"> revenue · </span>
            <span className="font-semibold text-shop_orange">
              {formatPrice(rangeProfit)}
            </span>
            <span className="text-lightColor"> profit</span>
          </p>
        </div>
        <div className="text-right text-xs text-lightColor">
          <p>Categories: {categoryCount}</p>
          <p>Brands: {brandCount}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                rangePreset === preset.id && !isCustom
                  ? "border-shop_dark_green bg-shop_dark_green text-white"
                  : "border-black/10 bg-shop_light_bg text-darkColor hover:border-shop_light_green",
              )}
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() =>
              startTransition(() => {
                router.push(
                  `/admin?range=custom&from=${encodeURIComponent(customFrom)}&to=${encodeURIComponent(customTo)}`,
                );
              })
            }
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              isCustom
                ? "border-shop_dark_green bg-shop_dark_green text-white"
                : "border-black/10 bg-shop_light_bg text-darkColor hover:border-shop_light_green",
            )}
          >
            Custom
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-2 rounded-xl border border-black/10 bg-shop_light_bg/50 p-3">
          <label className="space-y-1 text-xs font-medium text-darkColor">
            <span>From</span>
            <input
              type="date"
              value={customFrom}
              max={customTo}
              onChange={(event) => setCustomFrom(event.target.value)}
              className="block rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-shop_light_green"
            />
          </label>
          <label className="space-y-1 text-xs font-medium text-darkColor">
            <span>To</span>
            <input
              type="date"
              value={customTo}
              min={customFrom}
              max={toPkDateKey()}
              onChange={(event) => setCustomTo(event.target.value)}
              className="block rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-shop_light_green"
            />
          </label>
          <button
            type="button"
            onClick={applyCustom}
            className="rounded-lg bg-shop_btn_dark_green px-4 py-2 text-sm font-semibold text-white hover:bg-shop_dark_green/90"
          >
            Apply dates
          </button>
        </div>
        <p className="text-[11px] text-lightColor">
          {seriesGranularity === "hour"
            ? "Today shows each hour from 12:00 AM–11:59 PM Pakistan time."
            : "Days run midnight–midnight Pakistan time (Asia/Karachi)."}
        </p>
      </div>

      <SalesChart data={data} granularity={seriesGranularity} />
    </div>
  );
};

export default SalesOverview;
