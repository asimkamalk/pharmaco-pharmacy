"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  normalizePackType,
  purchasePriceForPack,
  stockUnitsForLine,
  unitPriceForPack,
} from "@/lib/pack";
import { resolveDeliveryFee } from "@/lib/delivery";
import { prisma } from "@/lib/prisma";
import type {
  AddressLabel,
  Order,
  OrderStatus,
  PackType,
  PaymentMethod,
  PaymentStatus,
  PrescriptionStatus,
} from "@/types";

function createOrderNumber() {
  const stamp = Date.now().toString().slice(-8);
  const rand = Math.floor(100 + Math.random() * 900);
  return `PHC-${stamp}-${rand}`;
}

function paymentStatusFor(method: PaymentMethod): PaymentStatus {
  if (method === "cash_on_delivery") return "not_required";
  return "pending_verification";
}

export interface PlaceOrderInput {
  address: {
    label: AddressLabel;
    customLabel?: string;
    fullName: string;
    phone: string;
    email?: string;
    addressLine: string;
    area: string;
    city: string;
  };
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  prescriptionReference?: string;
  prescriptionUrl?: string;
  prescriptionFileName?: string;
  prescriptionMimeType?: string;
  orderNotes?: string;
  items: { productId: string; quantity: number; packType?: PackType }[];
}

function mapDbOrder(order: {
  id: string;
  orderNumber: string;
  createdAt: Date;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentReference: string | null;
  prescriptionReference: string | null;
  prescriptionUrl: string | null;
  prescriptionFileName: string | null;
  prescriptionMimeType: string | null;
  prescriptionStatus: string;
  prescriptionAdminNote: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  addressLabel: string;
  addressCustomLabel: string | null;
  addressLine: string;
  area: string;
  city: string;
  orderNotes: string | null;
  subtotal: number;
  discountTotal: number;
  customerDiscountPercent: number;
  customerDiscountAmount: number;
  deliveryFee: number;
  deliveryZoneLabel: string | null;
  costTotal: number;
  grandTotal: number;
  userId: string | null;
  items: {
    productId: string | null;
    name: string;
    slug: string;
    image: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    purchasePrice: number;
    discount: number;
    requiresPrescription: boolean;
    packType: string;
    soldAsStrip: boolean;
    unitsPerStrip: number | null;
    stripsPerBox: number | null;
  }[];
}): Order {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt.toISOString(),
    status: order.status as OrderStatus,
    paymentMethod: order.paymentMethod as PaymentMethod,
    paymentStatus: order.paymentStatus as PaymentStatus,
    paymentReference: order.paymentReference ?? undefined,
    prescriptionReference: order.prescriptionReference ?? undefined,
    prescriptionUrl: order.prescriptionUrl ?? undefined,
    prescriptionFileName: order.prescriptionFileName ?? undefined,
    prescriptionMimeType: order.prescriptionMimeType ?? undefined,
    prescriptionStatus: order.prescriptionStatus as PrescriptionStatus,
    prescriptionAdminNote: order.prescriptionAdminNote ?? undefined,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    shippingAddress: {
      label: order.addressLabel as AddressLabel,
      customLabel: order.addressCustomLabel ?? undefined,
      addressLine: order.addressLine,
      area: order.area,
      city: order.city,
    },
    orderNotes: order.orderNotes ?? undefined,
    items: order.items.map((item) => ({
      productId: item.productId ?? "",
      name: item.name,
      slug: item.slug,
      image: item.image,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      purchasePrice: item.purchasePrice,
      discount: item.discount,
      requiresPrescription: item.requiresPrescription,
      packType: normalizePackType(item.packType, item.soldAsStrip),
      soldAsStrip:
        normalizePackType(item.packType, item.soldAsStrip) === "strip",
      unitsPerStrip: item.unitsPerStrip ?? undefined,
      stripsPerBox: item.stripsPerBox ?? undefined,
    })),
    subtotal: order.subtotal,
    discountTotal: order.discountTotal,
    customerDiscountPercent: order.customerDiscountPercent,
    customerDiscountAmount: order.customerDiscountAmount,
    deliveryFee: order.deliveryFee,
    deliveryZoneLabel: order.deliveryZoneLabel ?? undefined,
    costTotal: order.costTotal,
    grandTotal: order.grandTotal,
    userId: order.userId,
  };
}

export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  const session = await auth();
  if (!input.items.length) {
    throw new Error("Cart is empty");
  }

  const productIds = input.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isArchived: false },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  if (products.length !== productIds.length) {
    throw new Error("One or more products are unavailable");
  }

  const productMap = Object.fromEntries(
    products.map((product) => [product.id, product]),
  );

  const lineItems = input.items.map((item) => {
    const product = productMap[item.productId];
    if (!product) throw new Error("Product not found");
    if (item.quantity < 1) {
      throw new Error("Invalid quantity");
    }

    const packType = normalizePackType(
      item.packType ?? (product.sellByStrip ? "box" : "unit"),
    );

    if (product.sellByStrip && packType === "unit") {
      throw new Error(`Choose box or strip for ${product.name}`);
    }
    if (!product.sellByStrip && packType !== "unit") {
      throw new Error(`${product.name} is not sold by box/strip`);
    }
    if (product.sellByStrip && packType === "strip" && !product.stripPrice) {
      throw new Error(`Strip price is not configured for ${product.name}`);
    }
    if (
      product.sellByStrip &&
      packType === "box" &&
      (!product.stripsPerBox || product.stripsPerBox < 1)
    ) {
      throw new Error(`Box size is not configured for ${product.name}`);
    }

    const stockNeeded = stockUnitsForLine(product, packType, item.quantity);
    if (product.stock < stockNeeded) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    return {
      product,
      quantity: item.quantity,
      packType,
      unitPrice: unitPriceForPack(product, packType),
      purchasePrice: purchasePriceForPack(product, packType),
      stockNeeded,
      listPrice:
        packType === "strip" ? (product.stripPrice ?? 0) : product.price,
    };
  });

  // Same product may appear as box + strip — check combined stock
  const stockDemand = new Map<string, number>();
  for (const line of lineItems) {
    stockDemand.set(
      line.product.id,
      (stockDemand.get(line.product.id) ?? 0) + line.stockNeeded,
    );
  }
  for (const line of lineItems) {
    const needed = stockDemand.get(line.product.id) ?? 0;
    if (line.product.stock < needed) {
      throw new Error(`Insufficient stock for ${line.product.name}`);
    }
  }

  const requiresPrescription = lineItems.some(
    (line) => line.product.requiresPrescription,
  );
  if (requiresPrescription && !input.prescriptionUrl?.trim()) {
    throw new Error("Please upload a clear photo or PDF of your prescription");
  }
  if (
    input.paymentMethod !== "cash_on_delivery" &&
    (!input.paymentReference || input.paymentReference.trim().length < 4)
  ) {
    throw new Error("Payment reference is required");
  }

  const subtotal = lineItems.reduce(
    (total, line) => total + line.unitPrice * line.quantity,
    0,
  );
  const productDiscountTotal = lineItems.reduce(
    (total, line) =>
      total + (line.listPrice - line.unitPrice) * line.quantity,
    0,
  );
  const costTotal = lineItems.reduce(
    (total, line) => total + line.purchasePrice * line.quantity,
    0,
  );

  // Order % discount is applied later by admin on the order detail page
  const orderDiscountPercent = 0;
  const orderDiscountAmount = 0;
  const discountTotal = productDiscountTotal;

  const delivery = await resolveDeliveryFee({
    city: input.address.city,
    area: input.address.area,
    subtotal,
  });
  const deliveryFee = delivery.fee;

  const email =
    input.address.email?.trim() ||
    session?.user?.email ||
    `${input.address.phone.replace(/\s+/g, "")}@customer.local`;

  const created = await prisma.$transaction(async (tx) => {
    for (const [productId, needed] of stockDemand.entries()) {
      const updated = await tx.product.updateMany({
        where: { id: productId, stock: { gte: needed } },
        data: { stock: { decrement: needed } },
      });
      if (updated.count !== 1) {
        const product = productMap[productId];
        throw new Error(
          `Insufficient stock for ${product?.name ?? "product"}`,
        );
      }
    }

    return tx.order.create({
      data: {
        orderNumber: createOrderNumber(),
        userId: session?.user?.id,
        status: "pending",
        paymentMethod: input.paymentMethod,
        paymentStatus: paymentStatusFor(input.paymentMethod),
        paymentReference: input.paymentReference?.trim() || null,
        prescriptionReference: input.prescriptionReference?.trim() || null,
        prescriptionUrl: input.prescriptionUrl?.trim() || null,
        prescriptionFileName: input.prescriptionFileName?.trim() || null,
        prescriptionMimeType: input.prescriptionMimeType?.trim() || null,
        prescriptionStatus: requiresPrescription
          ? "pending_review"
          : "not_required",
        customerName: input.address.fullName,
        customerPhone: input.address.phone,
        customerEmail: email,
        addressLabel: input.address.label,
        addressCustomLabel: input.address.customLabel || null,
        addressLine: input.address.addressLine,
        area: input.address.area,
        city: input.address.city,
        orderNotes: input.orderNotes?.trim() || null,
        subtotal,
        discountTotal,
        customerDiscountPercent: orderDiscountPercent,
        customerDiscountAmount: orderDiscountAmount,
        deliveryFee,
        deliveryZoneLabel: delivery.zoneLabel,
        costTotal,
        grandTotal: subtotal + deliveryFee,
        items: {
          create: lineItems.map((line) => ({
            productId: line.product.id,
            name: line.product.name,
            slug: line.product.slug,
            image:
              line.product.images[0]?.url ||
              "/images/products/placeholder.svg",
            sku: line.product.sku,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            purchasePrice: line.purchasePrice,
            discount: line.product.discount,
            requiresPrescription: line.product.requiresPrescription,
            packType: line.packType,
            soldAsStrip: line.packType === "strip",
            unitsPerStrip: line.product.sellByStrip
              ? line.product.unitsPerStrip
              : null,
            stripsPerBox: line.product.sellByStrip
              ? line.product.stripsPerBox
              : null,
          })),
        },
      },
      include: { items: true },
    });
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/admin");
  revalidatePath("/admin/orders");

  return mapDbOrder(created);
}

async function orderCountsByUserId(
  userIds: (string | null | undefined)[],
): Promise<Map<string, number>> {
  const ids = [...new Set(userIds.filter((id): id is string => Boolean(id)))];
  if (ids.length === 0) return new Map();

  const rows = await prisma.order.groupBy({
    by: ["userId"],
    where: { userId: { in: ids } },
    _count: { _all: true },
  });

  return new Map(
    rows
      .filter((row) => row.userId)
      .map((row) => [row.userId as string, row._count._all]),
  );
}

export async function getOrderById(id: string): Promise<Order | null> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) return null;

  const mapped = mapDbOrder(order);
  if (order.userId) {
    const counts = await orderCountsByUserId([order.userId]);
    mapped.customerOrderCount = counts.get(order.userId) ?? 0;
  }
  return mapped;
}

export async function getOrdersForUser(userId: string): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return orders.map(mapDbOrder);
}

export async function getAllOrders(query?: string): Promise<Order[]> {
  const q = query?.trim();
  const orders = await prisma.order.findMany({
    where: q
      ? {
          OR: [
            { orderNumber: { contains: q } },
            { customerName: { contains: q } },
            { customerPhone: { contains: q } },
            { customerEmail: { contains: q } },
          ],
        }
      : undefined,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  const counts = await orderCountsByUserId(orders.map((order) => order.userId));
  return orders.map((order) => {
    const mapped = mapDbOrder(order);
    if (order.userId) {
      mapped.customerOrderCount = counts.get(order.userId) ?? 0;
    }
    return mapped;
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: { items: true },
  });
  return mapDbOrder(order);
}
