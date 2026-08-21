import { prisma } from "@/lib/prisma";

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export async function getDashboardStats() {
  const now = new Date();
  const last30 = new Date(now);
  last30.setDate(now.getDate() - 29);
  const from = startOfDay(last30);

  const [
    productCount,
    categoryCount,
    brandCount,
    customerCount,
    orderCount,
    pendingOrders,
    lowStock,
    recentOrders,
    salesOrders,
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
    prisma.order.findMany({
      where: {
        createdAt: { gte: from },
        status: { not: "cancelled" },
      },
      select: {
        createdAt: true,
        grandTotal: true,
        costTotal: true,
        status: true,
      },
    }),
  ]);

  const dayMap = new Map<
    string,
    { date: string; revenue: number; profit: number; orders: number }
  >();

  for (let i = 0; i < 30; i++) {
    const day = new Date(from);
    day.setDate(from.getDate() + i);
    const key = day.toISOString().slice(0, 10);
    dayMap.set(key, { date: key, revenue: 0, profit: 0, orders: 0 });
  }

  let revenue30 = 0;
  let profit30 = 0;

  for (const order of salesOrders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    const bucket = dayMap.get(key);
    if (!bucket) continue;
    bucket.revenue += order.grandTotal;
    bucket.profit += order.grandTotal - order.costTotal;
    bucket.orders += 1;
    revenue30 += order.grandTotal;
    profit30 += order.grandTotal - order.costTotal;
  }

  return {
    productCount,
    categoryCount,
    brandCount,
    customerCount,
    orderCount,
    pendingOrders,
    lowStock,
    recentOrders,
    revenue30,
    profit30,
    salesSeries: Array.from(dayMap.values()),
  };
}
