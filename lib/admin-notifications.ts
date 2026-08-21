import { prisma } from "@/lib/prisma";

export type PendingOrderNotice = {
  id: string;
  orderNumber: string;
  customerName: string;
  grandTotal: number;
  status: string;
  createdAt: string;
};

export async function getPendingOrderNotifications(limit = 8) {
  const [pendingCount, pendingOrders] = await Promise.all([
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        grandTotal: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    pendingCount,
    orders: pendingOrders.map(
      (order): PendingOrderNotice => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        grandTotal: order.grandTotal,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
      }),
    ),
  };
}
