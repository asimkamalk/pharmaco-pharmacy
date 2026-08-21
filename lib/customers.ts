import { prisma } from "@/lib/prisma";

export async function getAdminCustomers(query?: string) {
  const q = query?.trim();
  return prisma.user.findMany({
    where: {
      role: "USER",
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { email: { contains: q } },
              { username: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      orders: {
        select: { grandTotal: true, id: true },
      },
      _count: { select: { orders: true, addresses: true } },
    },
  });
}

export async function getAdminCustomerById(id: string) {
  return prisma.user.findFirst({
    where: { id, role: "USER" },
    include: {
      addresses: { orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }] },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          grandTotal: true,
          createdAt: true,
          paymentMethod: true,
        },
      },
      _count: { select: { orders: true, addresses: true } },
    },
  });
}
