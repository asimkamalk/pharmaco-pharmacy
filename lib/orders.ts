"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDiscountedPrice } from "@/lib/utils";
import { getSiteConfig } from "@/lib/site";
import type {
  AddressLabel,
  Order,
  OrderStatus,
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
  items: { productId: string; quantity: number }[];
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
  deliveryFee: number;
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
    })),
    subtotal: order.subtotal,
    discountTotal: order.discountTotal,
    deliveryFee: order.deliveryFee,
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
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }
    if (item.quantity < 1) {
      throw new Error("Invalid quantity");
    }
    const unitPrice = getDiscountedPrice(product.price, product.discount);
    return {
      product,
      quantity: item.quantity,
      unitPrice,
    };
  });

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
  const discountTotal = lineItems.reduce(
    (total, line) =>
      total + (line.product.price - line.unitPrice) * line.quantity,
    0,
  );
  const costTotal = lineItems.reduce(
    (total, line) => total + line.product.purchasePrice * line.quantity,
    0,
  );
  const siteConfig = await getSiteConfig();
  const deliveryFee =
    subtotal >= siteConfig.delivery.freeDeliveryAbove
      ? 0
      : siteConfig.delivery.standardFee;

  const email =
    input.address.email?.trim() ||
    session?.user?.email ||
    `${input.address.phone.replace(/\s+/g, "")}@customer.local`;

  const created = await prisma.$transaction(async (tx) => {
    for (const line of lineItems) {
      const updated = await tx.product.updateMany({
        where: { id: line.product.id, stock: { gte: line.quantity } },
        data: { stock: { decrement: line.quantity } },
      });
      if (updated.count !== 1) {
        throw new Error(`Insufficient stock for ${line.product.name}`);
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
        deliveryFee,
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
            purchasePrice: line.product.purchasePrice,
            discount: line.product.discount,
            requiresPrescription: line.product.requiresPrescription,
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

export async function getOrderById(id: string): Promise<Order | null> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  return order ? mapDbOrder(order) : null;
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
  return orders.map(mapDbOrder);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: { items: true },
  });
  return mapDbOrder(order);
}
