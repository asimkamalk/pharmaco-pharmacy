import { prisma } from "@/lib/prisma";

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export type SalesRangePreset =
  | "7d"
  | "30d"
  | "3m"
  | "6m"
  | "1y"
  | "custom";

export function resolveSalesRange(input: {
  preset?: string | null;
  from?: string | null;
  to?: string | null;
}) {
  const now = endOfDay(new Date());
  const preset = (input.preset || "30d") as SalesRangePreset;

  if (preset === "custom" && input.from && input.to) {
    const from = startOfDay(new Date(input.from));
    const to = endOfDay(new Date(input.to));
    if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime()) && from <= to) {
      return { preset, from, to, label: "Custom range" };
    }
  }

  const from = startOfDay(new Date(now));
  let label = "Last 30 days";

  switch (preset) {
    case "7d":
      from.setDate(from.getDate() - 6);
      label = "Last 7 days";
      break;
    case "3m":
      from.setMonth(from.getMonth() - 3);
      label = "Last 3 months";
      break;
    case "6m":
      from.setMonth(from.getMonth() - 6);
      label = "Last 6 months";
      break;
    case "1y":
      from.setFullYear(from.getFullYear() - 1);
      label = "Last 1 year";
      break;
    case "30d":
    default:
      from.setDate(from.getDate() - 29);
      label = "Last 30 days";
      break;
  }

  return {
    preset: preset === "custom" ? ("30d" as const) : preset,
    from,
    to: now,
    label,
  };
}

export async function getSalesSeries(from: Date, to: Date) {
  const start = startOfDay(from);
  const end = endOfDay(to);

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

  const dayMap = new Map<
    string,
    { date: string; revenue: number; profit: number; orders: number }
  >();

  const cursor = new Date(start);
  while (cursor <= end) {
    const key = toDateKey(cursor);
    dayMap.set(key, { date: key, revenue: 0, profit: 0, orders: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  let revenue = 0;
  let profit = 0;

  for (const order of salesOrders) {
    const key = toDateKey(order.createdAt);
    const bucket = dayMap.get(key);
    if (!bucket) continue;
    bucket.revenue += order.grandTotal;
    bucket.profit += order.grandTotal - order.costTotal;
    bucket.orders += 1;
    revenue += order.grandTotal;
    profit += order.grandTotal - order.costTotal;
  }

  // For long ranges, aggregate by week/month to keep the chart readable
  const dayCount = dayMap.size;
  let series = Array.from(dayMap.values());

  if (dayCount > 120) {
    series = aggregateByMonth(series);
  } else if (dayCount > 45) {
    series = aggregateByWeek(series);
  }

  return { series, revenue, profit, dayCount };
}

function aggregateByWeek(
  days: { date: string; revenue: number; profit: number; orders: number }[],
) {
  const weeks = new Map<
    string,
    { date: string; revenue: number; profit: number; orders: number }
  >();

  for (const day of days) {
    const date = new Date(day.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const key = toDateKey(weekStart);
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
    getSalesSeries(resolved.from, resolved.to),
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
    rangeFrom: toDateKey(resolved.from),
    rangeTo: toDateKey(resolved.to),
    salesSeries: sales.series,
  };
}
