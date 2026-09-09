import { prisma } from "@/lib/prisma";

export type AdminAttentionNotice = {
  id: string;
  kind: "order" | "rx_request" | "rx_review" | "password_reset";
  title: string;
  customerName: string;
  href: string;
  grandTotal?: number;
  status: string;
  createdAt: string;
  needsRxReview?: boolean;
};

export async function getPendingOrderNotifications(limit = 8) {
  const [
    pendingCount,
    rxReviewCount,
    rxRequestCount,
    passwordResetCount,
    pendingOrders,
    rxRequests,
    passwordResets,
  ] = await Promise.all([
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.count({
      where: { prescriptionStatus: "pending_review" },
    }),
    prisma.prescriptionRequest.count({
      where: { status: { in: ["pending", "in_progress"] } },
    }),
    prisma.passwordResetRequest.count({ where: { status: "pending" } }),
    prisma.order.findMany({
      where: {
        OR: [
          { status: "pending" },
          { prescriptionStatus: "pending_review" },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        grandTotal: true,
        status: true,
        createdAt: true,
        prescriptionStatus: true,
      },
    }),
    prisma.prescriptionRequest.findMany({
      where: { status: { in: ["pending", "in_progress"] } },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        requestNumber: true,
        customerName: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.passwordResetRequest.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        email: true,
        username: true,
        status: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    }),
  ]);

  const notices: AdminAttentionNotice[] = [
    ...pendingOrders.map((order): AdminAttentionNotice => ({
      id: order.id,
      kind:
        order.prescriptionStatus === "pending_review"
          ? "rx_review"
          : "order",
      title: order.orderNumber,
      customerName: order.customerName,
      href: `/admin/orders/${order.id}`,
      grandTotal: order.grandTotal,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      needsRxReview: order.prescriptionStatus === "pending_review",
    })),
    ...rxRequests.map((req): AdminAttentionNotice => ({
      id: req.id,
      kind: "rx_request",
      title: req.requestNumber,
      customerName: req.customerName,
      href: `/admin/prescription-requests/${req.id}`,
      status: req.status,
      createdAt: req.createdAt.toISOString(),
    })),
    ...passwordResets.map((req): AdminAttentionNotice => ({
      id: req.id,
      kind: "password_reset",
      title: "Password reset",
      customerName: req.user?.name || `@${req.username} · ${req.email}`,
      href: "/admin/password-resets",
      status: req.status,
      createdAt: req.createdAt.toISOString(),
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);

  const orderAttention = await prisma.order.count({
    where: {
      OR: [{ status: "pending" }, { prescriptionStatus: "pending_review" }],
    },
  });

  return {
    pendingCount,
    rxReviewCount,
    rxRequestCount,
    passwordResetCount,
    attentionCount: orderAttention + rxRequestCount + passwordResetCount,
    orders: notices.map((n) => ({
      id: n.id,
      orderNumber: n.title,
      customerName: n.customerName,
      grandTotal: n.grandTotal ?? 0,
      status: n.status,
      createdAt: n.createdAt,
      needsRxReview: n.needsRxReview || n.kind === "rx_request",
      href: n.href,
      kind: n.kind,
    })),
  };
}

/** @deprecated alias kept for older imports */
export type PendingOrderNotice = {
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
