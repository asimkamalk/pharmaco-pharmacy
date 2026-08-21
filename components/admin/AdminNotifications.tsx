"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatPrice, cn } from "@/lib/utils";

export type AdminOrderNotice = {
  id: string;
  orderNumber: string;
  customerName: string;
  grandTotal: number;
  status: string;
  createdAt: string;
  needsRxReview?: boolean;
  href?: string;
  kind?: string;
};

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface AdminNotificationsProps {
  pendingCount: number;
  rxReviewCount?: number;
  attentionCount?: number;
  orders: AdminOrderNotice[];
}

const AdminNotifications = ({
  pendingCount: initialPending,
  rxReviewCount: initialRx = 0,
  attentionCount: initialAttention,
  orders: initialOrders,
}: AdminNotificationsProps) => {
  const [pendingCount, setPendingCount] = useState(initialPending);
  const [rxReviewCount, setRxReviewCount] = useState(initialRx);
  const [attentionCount, setAttentionCount] = useState(
    initialAttention ?? initialPending,
  );
  const [orders, setOrders] = useState(initialOrders);

  useEffect(() => {
    setPendingCount(initialPending);
    setRxReviewCount(initialRx);
    setAttentionCount(initialAttention ?? initialPending);
    setOrders(initialOrders);
  }, [initialPending, initialRx, initialAttention, initialOrders]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        pendingCount: number;
        rxReviewCount?: number;
        attentionCount?: number;
        orders: AdminOrderNotice[];
      };
      setPendingCount(data.pendingCount);
      setRxReviewCount(data.rxReviewCount ?? 0);
      setAttentionCount(data.attentionCount ?? data.pendingCount);
      setOrders(data.orders);
    } catch {
      /* keep last known state */
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onFocus = () => {
      void refresh();
    };
    window.addEventListener("focus", onFocus);
    const id = window.setInterval(() => {
      void refresh();
    }, 15_000);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(id);
    };
  }, [refresh]);

  const badge = attentionCount > 99 ? "99+" : String(attentionCount);

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "relative inline-flex h-10 w-10 items-center justify-center overflow-visible rounded-xl border border-black/8 bg-white text-darkColor transition-colors",
          attentionCount > 0 &&
            "border-shop_orange/35 bg-shop_orange/5 text-shop_dark_green",
          "hover:border-shop_light_green/40 hover:bg-shop_light_green/5 hover:text-shop_dark_green",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shop_light_green/40",
        )}
        aria-label={
          attentionCount > 0
            ? `${attentionCount} items need attention`
            : "Order notifications"
        }
      >
        <Bell className="h-4 w-4" />
        {attentionCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-shop_orange px-1 text-[10px] font-bold leading-none text-white shadow-md ring-2 ring-white">
            {badge}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[22rem] gap-0 overflow-hidden rounded-2xl border border-black/8 bg-white p-0 shadow-lg ring-0"
      >
        <PopoverHeader className="border-b border-black/6 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <PopoverTitle className="text-sm font-semibold text-darkColor">
              Needs attention
            </PopoverTitle>
            {attentionCount > 0 && (
              <span className="rounded-full bg-shop_orange/15 px-2 py-0.5 text-[11px] font-semibold text-shop_orange">
                {attentionCount} open
              </span>
            )}
          </div>
          <PopoverDescription className="text-xs text-lightColor">
            Orders, Rx checkout reviews, and Order-by-Prescription requests
            {pendingCount || rxReviewCount
              ? ` · ${pendingCount} pending · ${rxReviewCount} Rx reviews`
              : ""}
          </PopoverDescription>
        </PopoverHeader>

        <div className="max-h-80 overflow-y-auto">
          {orders.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-lightColor">
              Nothing waiting right now.
            </p>
          ) : (
            <ul className="divide-y divide-black/5">
              {orders.map((order) => (
                <li key={`${order.kind ?? "order"}-${order.id}`}>
                  <Link
                    href={
                      order.href ??
                      (order.kind === "rx_request"
                        ? `/admin/prescription-requests/${order.id}`
                        : `/admin/orders/${order.id}`)
                    }
                    className="flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-shop_light_bg/80"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-darkColor">
                        {order.orderNumber}
                      </p>
                      <p className="truncate text-xs text-lightColor">
                        {order.customerName}
                      </p>
                      <p className="mt-0.5 text-[11px] text-lightColor/80">
                        {relativeTime(order.createdAt)}
                        {order.kind === "rx_request"
                          ? " · Order by Rx"
                          : order.needsRxReview
                            ? " · Rx review"
                            : ""}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      {order.kind !== "rx_request" && order.grandTotal > 0 ? (
                        <p className="text-sm font-semibold text-shop_dark_green">
                          {formatPrice(order.grandTotal)}
                        </p>
                      ) : (
                        <p className="text-sm font-semibold text-shop_orange">
                          Rx
                        </p>
                      )}
                      <p className="mt-0.5 text-[11px] capitalize text-shop_orange">
                        {order.kind === "rx_request"
                          ? "Build order"
                          : order.needsRxReview
                            ? "Rx pending"
                            : order.status.replaceAll("_", " ")}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1 border-t border-black/6 p-2">
          <Link
            href="/admin/orders"
            className="flex items-center justify-center rounded-xl px-2 py-2.5 text-xs font-semibold text-shop_dark_green hover:bg-shop_light_green/10"
          >
            Orders
          </Link>
          <Link
            href="/admin/prescription-requests"
            className="flex items-center justify-center rounded-xl px-2 py-2.5 text-xs font-semibold text-shop_orange hover:bg-shop_orange/10"
          >
            Order by Rx
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AdminNotifications;
