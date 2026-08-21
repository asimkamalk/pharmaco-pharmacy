import { prisma } from "@/lib/prisma";
import {
  endOfPkDay,
  endOfPkDayFromKey,
  pkHourKey,
  shiftPkDateKey,
  startOfPkDay,
  startOfPkDayFromKey,
  toPkDateKey,
  toPkHour,
} from "@/lib/datetime";

export type SalesRangePreset =
  | "today"
  | "7d"
  | "30d"
  | "3m"
  | "6m"
  | "1y"
  | "custom";

export type SalesSeriesGranularity = "hour" | "day";

export function resolveSalesRange(input: {
  preset?: string | null;
  from?: string | null;
  to?: string | null;
}) {
  const todayKey = toPkDateKey();
  const nowEnd = endOfPkDayFromKey(todayKey);
  const preset = (input.preset || "30d") as SalesRangePreset;

  if (preset === "custom" && input.from && input.to) {
    const fromKey = input.from;
    const toKey = input.to;
    const from = startOfPkDayFromKey(fromKey);
    const to = endOfPkDayFromKey(toKey);
    if (
      !Number.isNaN(from.getTime()) &&
      !Number.isNaN(to.getTime()) &&
      from <= to
    ) {
      return { preset, from, to, label: "Custom range" };
    }
  }

  let fromKey = todayKey;
  let label = "Last 30 days";
  let resolvedPreset: SalesRangePreset = preset;

  switch (preset) {
    case "today":
      fromKey = todayKey;
      label = "Today";
      break;
    case "7d":
      fromKey = shiftPkDateKey(todayKey, -6);
      label = "Last 7 days";
      break;
    case "3m":
      fromKey = shiftPkDateKey(todayKey, -90);
      label = "Last 3 months";
      break;
    case "6m":
      fromKey = shiftPkDateKey(todayKey, -180);
      label = "Last 6 months";
      break;
    case "1y":
      fromKey = shiftPkDateKey(todayKey, -365);
      label = "Last 1 year";
      break;
    case "30d":
    default:
      fromKey = shiftPkDateKey(todayKey, -29);
      label = "Last 30 days";
      resolvedPreset = "30d";
      break;
  }

  return {
    preset: resolvedPreset === "custom" ? ("30d" as const) : resolvedPreset,
    from: startOfPkDayFromKey(fromKey),
    to: nowEnd,
    label,
  };
}

export async function getSalesSeries(
  from: Date,
  to: Date,
  granularity: SalesSeriesGranularity = "day",
) {
  const start = startOfPkDay(from);
  const end = endOfPkDay(to);

  const salesOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      status: { not: "cancelled" },
    },
    select: {
      createdAt: true,
      grandTotal: true,
      costTotal: true,
    },
  });

  if (granularity === "hour") {
    return buildHourlySeries(salesOrders, start);
  }

  return buildDailySeries(salesOrders, start, end);
}

function buildHourlySeries(
  salesOrders: { createdAt: Date; grandTotal: number; costTotal: number }[],
  dayStart: Date,
) {
  const hourMap = new Map<
    string,
    { date: string; revenue: number; profit: number; orders: number }
  >();

  for (let hour = 0; hour < 24; hour += 1) {
    const key = pkHourKey(hour);
    hourMap.set(key, { date: key, revenue: 0, profit: 0, orders: 0 });
  }

  let revenue = 0;
  let profit = 0;
  const dayKey = toPkDateKey(dayStart);

  for (const order of salesOrders) {
    if (toPkDateKey(order.createdAt) !== dayKey) continue;
    const key = pkHourKey(toPkHour(order.createdAt));
    const bucket = hourMap.get(key);
    if (!bucket) continue;
    bucket.revenue += order.grandTotal;
    bucket.profit += order.grandTotal - order.costTotal;
    bucket.orders += 1;
    revenue += order.grandTotal;
    profit += order.grandTotal - order.costTotal;
  }

  return {
    series: Array.from(hourMap.values()),
    revenue,
    profit,
    dayCount: 1,
    granularity: "hour" as const,
  };
}

function buildDailySeries(
  salesOrders: { createdAt: Date; grandTotal: number; costTotal: number }[],
  start: Date,
  end: Date,
) {
  const dayMap = new Map<
    string,
    { date: string; revenue: number; profit: number; orders: number }
  >();

  let cursorKey = toPkDateKey(start);
  const endKey = toPkDateKey(end);
  while (cursorKey <= endKey) {
    dayMap.set(cursorKey, {
      date: cursorKey,
      revenue: 0,
      profit: 0,
      orders: 0,
    });
    if (cursorKey === endKey) break;
    cursorKey = shiftPkDateKey(cursorKey, 1);
  }

  let revenue = 0;
  let profit = 0;

  for (const order of salesOrders) {
    const key = toPkDateKey(order.createdAt);
    const bucket = dayMap.get(key);
    if (!bucket) continue;
    bucket.revenue += order.grandTotal;
    bucket.profit += order.grandTotal - order.costTotal;
    bucket.orders += 1;
    revenue += order.grandTotal;
    profit += order.grandTotal - order.costTotal;
  }

  const dayCount = dayMap.size;
  let series = Array.from(dayMap.values());

  if (dayCount > 120) {
    series = aggregateByMonth(series);
  } else if (dayCount > 45) {
    series = aggregateByWeek(series);
  }

  return {
    series,
    revenue,
    profit,
    dayCount,
    granularity: "day" as const,
  };
}

function aggregateByWeek(
  days: { date: string; revenue: number; profit: number; orders: number }[],
) {
  const weeks = new Map<
    string,
    { date: string; revenue: number; profit: number; orders: number }
  >();

  for (const day of days) {
    const date = startOfPkDayFromKey(day.date);
    const weekday = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Karachi",
      weekday: "short",
    }).format(date);
    const offsets: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    const sundayOffset = offsets[weekday] ?? 0;
    const key = shiftPkDateKey(day.date, -sundayOffset);
    const bucket = weeks.get(key) ?? {
      date: key,
      revenue: 0,
      profit: 0,
      orders: 0,
    };
    bucket.revenue += day.revenue;
    bucket.profit += day.profit;
    bucket.orders += day.orders;
    weeks.set(key, bucket);
  }

  return Array.from(weeks.values());
}

function aggregateByMonth(
  days: { date: string; revenue: number; profit: number; orders: number }[],
) {
  const months = new Map<
    string,
    { date: string; revenue: number; profit: number; orders: number }
  >();

  for (const day of days) {
    const key = `${day.date.slice(0, 7)}-01`;
    const bucket = months.get(key) ?? {
      date: key,
      revenue: 0,
      profit: 0,
      orders: 0,
    };
    bucket.revenue += day.revenue;
    bucket.profit += day.profit;
    bucket.orders += day.orders;
    months.set(key, bucket);
  }

  return Array.from(months.values());
}

export async function getDashboardStats(range?: {
  preset?: string | null;
  from?: string | null;
  to?: string | null;
}) {
  const resolved = resolveSalesRange(range ?? { preset: "30d" });

  const [
    productCount,
    categoryCount,
    brandCount,
    customerCount,
    orderCount,
    pendingOrders,
    lowStock,
    recentOrders,
    sales,
  ] = await Promise.all([
    prisma.product.count({ where: { isArchived: false } }),
    prisma.category.count({ where: { isActive: true } }),
    prisma.brand.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.product.findMany({
      where: { isArchived: false, stock: { lte: 10 } },
      orderBy: { stock: "asc" },
      take: 8,
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        purchasePrice: true,
        price: true,
      },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        status: true,
        grandTotal: true,
        createdAt: true,
        paymentMethod: true,
      },
    }),
    getSalesSeries(
      resolved.from,
      resolved.to,
      resolved.preset === "today" ? "hour" : "day",
    ),
  ]);

  return {
    productCount,
    categoryCount,
    brandCount,
    customerCount,
    orderCount,
    pendingOrders,
    lowStock,
    recentOrders,
    revenue30: sales.revenue,
    profit30: sales.profit,
    rangeRevenue: sales.revenue,
    rangeProfit: sales.profit,
    rangeLabel: resolved.label,
    rangePreset: resolved.preset,
    rangeFrom: toPkDateKey(resolved.from),
    rangeTo: toPkDateKey(resolved.to),
    salesSeries: sales.series,
    seriesGranularity: sales.granularity,
  };
}
