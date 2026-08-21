import { prisma } from "@/lib/prisma";
import { getDiscountedPrice } from "@/lib/utils";
import { getSiteConfig } from "@/lib/site";
import type { PaymentMethod } from "@/types";

export type PrescriptionRequestStatus =
  | "pending"
  | "in_progress"
  | "fulfilled"
  | "rejected"
  | "cancelled";

export type PrescriptionRequestRecord = {
  id: string;
  requestNumber: string;
  userId?: string;
  status: PrescriptionRequestStatus;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  addressLabel: string;
  addressCustomLabel?: string;
  addressLine: string;
  area: string;
  city: string;
  prescriptionUrl: string;
  prescriptionFileName?: string;
  prescriptionMimeType?: string;
  medicinesNote: string;
  adminNote?: string;
  orderId?: string;
  orderNumber?: string;
  createdAt: string;
  updatedAt: string;
};

function createRequestNumber() {
  const stamp = Date.now().toString().slice(-8);
  const rand = Math.floor(100 + Math.random() * 900);
  return `RXQ-${stamp}-${rand}`;
}

function createOrderNumber() {
  const stamp = Date.now().toString().slice(-8);
  const rand = Math.floor(100 + Math.random() * 900);
  return `PHC-${stamp}-${rand}`;
}

function mapRequest(row: {
  id: string;
  requestNumber: string;
  userId: string | null;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  addressLabel: string;
  addressCustomLabel: string | null;
  addressLine: string;
  area: string;
  city: string;
  prescriptionUrl: string;
  prescriptionFileName: string | null;
  prescriptionMimeType: string | null;
  medicinesNote: string;
  adminNote: string | null;
  orderId: string | null;
  createdAt: Date;
  updatedAt: Date;
  order?: { orderNumber: string } | null;
}): PrescriptionRequestRecord {
  return {
    id: row.id,
    requestNumber: row.requestNumber,
    userId: row.userId ?? undefined,
    status: row.status as PrescriptionRequestStatus,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    customerEmail: row.customerEmail ?? undefined,
    addressLabel: row.addressLabel,
    addressCustomLabel: row.addressCustomLabel ?? undefined,
    addressLine: row.addressLine,
    area: row.area,
    city: row.city,
    prescriptionUrl: row.prescriptionUrl,
    prescriptionFileName: row.prescriptionFileName ?? undefined,
    prescriptionMimeType: row.prescriptionMimeType ?? undefined,
    medicinesNote: row.medicinesNote,
    adminNote: row.adminNote ?? undefined,
    orderId: row.orderId ?? undefined,
    orderNumber: row.order?.orderNumber,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export type CreatePrescriptionRequestInput = {
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  addressLabel?: string;
  addressCustomLabel?: string;
  addressLine: string;
  area: string;
  city: string;
  prescriptionUrl: string;
  prescriptionFileName?: string;
  prescriptionMimeType?: string;
  medicinesNote?: string;
};

export async function createPrescriptionRequest(
  input: CreatePrescriptionRequestInput,
): Promise<PrescriptionRequestRecord> {
  const medicinesNote = (input.medicinesNote ?? "").trim();
  if (!input.prescriptionUrl.trim()) {
    throw new Error("Please upload your prescription photo or PDF");
  }
  if (!input.customerName.trim() || !input.customerPhone.trim()) {
    throw new Error("Name and phone are required");
  }
  if (
    !input.addressLine.trim() ||
    !input.area.trim() ||
    !input.city.trim()
  ) {
    throw new Error("Delivery address is required");
  }

  const created = await prisma.prescriptionRequest.create({
    data: {
      requestNumber: createRequestNumber(),
      userId: input.userId || null,
      status: "pending",
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone.trim(),
      customerEmail: input.customerEmail?.trim() || null,
      addressLabel: input.addressLabel?.trim() || "home",
      addressCustomLabel: input.addressCustomLabel?.trim() || null,
      addressLine: input.addressLine.trim(),
      area: input.area.trim(),
      city: input.city.trim(),
      prescriptionUrl: input.prescriptionUrl.trim(),
      prescriptionFileName: input.prescriptionFileName?.trim() || null,
      prescriptionMimeType: input.prescriptionMimeType?.trim() || null,
      medicinesNote: medicinesNote || "(No medicines note — see prescription)",
    },
    include: { order: { select: { orderNumber: true } } },
  });

  return mapRequest(created);
}

export async function getPrescriptionRequestById(id: string) {
  const row = await prisma.prescriptionRequest.findUnique({
    where: { id },
    include: { order: { select: { orderNumber: true } } },
  });
  return row ? mapRequest(row) : null;
}

export async function listPrescriptionRequests(query?: string) {
  const q = query?.trim();
  const rows = await prisma.prescriptionRequest.findMany({
    where: q
      ? {
          OR: [
            { requestNumber: { contains: q } },
            { customerName: { contains: q } },
            { customerPhone: { contains: q } },
            { medicinesNote: { contains: q } },
          ],
        }
      : undefined,
    include: { order: { select: { orderNumber: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapRequest);
}

export async function listPrescriptionRequestsForUser(userId: string) {
  const rows = await prisma.prescriptionRequest.findMany({
    where: { userId },
    include: { order: { select: { orderNumber: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapRequest);
}

export async function updatePrescriptionRequestStatus(
  id: string,
  status: PrescriptionRequestStatus,
  adminNote?: string,
) {
  const row = await prisma.prescriptionRequest.update({
    where: { id },
    data: {
      status,
      ...(adminNote !== undefined
        ? { adminNote: adminNote.trim() || null }
        : {}),
    },
    include: { order: { select: { orderNumber: true } } },
  });
  return mapRequest(row);
}

export type FulfillLine = { productId: string; quantity: number };

export type FulfillPrescriptionRequestInput = {
  requestId: string;
  items: FulfillLine[];
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  adminNote?: string;
};

/** Admin builds a real order from a prescription request */
export async function fulfillPrescriptionRequest(
  input: FulfillPrescriptionRequestInput,
) {
  const request = await prisma.prescriptionRequest.findUnique({
    where: { id: input.requestId },
  });
  if (!request) throw new Error("Prescription request not found");
  if (request.status === "fulfilled" && request.orderId) {
    throw new Error("This request already has an order");
  }
  if (request.status === "cancelled" || request.status === "rejected") {
    throw new Error("Cannot fulfill a cancelled or rejected request");
  }
  if (!input.items.length) {
    throw new Error("Add at least one product to create the order");
  }

  const paymentMethod = input.paymentMethod ?? "cash_on_delivery";
  if (
    paymentMethod !== "cash_on_delivery" &&
    (!input.paymentReference || input.paymentReference.trim().length < 4)
  ) {
    throw new Error("Payment reference is required for this payment method");
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
    if (item.quantity < 1) throw new Error("Invalid quantity");
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }
    return {
      product,
      quantity: item.quantity,
      unitPrice: getDiscountedPrice(product.price, product.discount),
    };
  });

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
    request.customerEmail?.trim() ||
    `${request.customerPhone.replace(/\s+/g, "")}@customer.local`;

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

    const order = await tx.order.create({
      data: {
        orderNumber: createOrderNumber(),
        userId: request.userId,
        status: "confirmed",
        paymentMethod,
        paymentStatus:
          paymentMethod === "cash_on_delivery"
            ? "not_required"
            : "pending_verification",
        paymentReference: input.paymentReference?.trim() || null,
        prescriptionReference: (request.medicinesNote || "").slice(0, 200),
        prescriptionUrl: request.prescriptionUrl,
        prescriptionFileName: request.prescriptionFileName,
        prescriptionMimeType: request.prescriptionMimeType,
        prescriptionStatus: "approved",
        prescriptionAdminNote:
          input.adminNote?.trim() ||
          `Created from prescription request ${request.requestNumber}`,
        customerName: request.customerName,
        customerPhone: request.customerPhone,
        customerEmail: email,
        addressLabel: request.addressLabel,
        addressCustomLabel: request.addressCustomLabel,
        addressLine: request.addressLine,
        area: request.area,
        city: request.city,
        orderNotes: `Order by prescription · ${request.requestNumber}${
          request.medicinesNote &&
          !request.medicinesNote.startsWith("(No medicines note")
            ? `\nCustomer note: ${request.medicinesNote}`
            : ""
        }`,
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
    });

    await tx.prescriptionRequest.update({
      where: { id: request.id },
      data: {
        status: "fulfilled",
        orderId: order.id,
        adminNote: input.adminNote?.trim() || request.adminNote,
      },
    });

    return order;
  });

  return created;
}
