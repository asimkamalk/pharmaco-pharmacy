"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { requireAdmin } from "@/lib/admin";
import { redirectWithFlash } from "@/lib/admin-flash";
import {
  createPrescriptionRequest,
  fulfillPrescriptionRequest,
  updatePrescriptionRequestStatus,
  type FulfillLine,
} from "@/lib/prescription-requests";
import type { PaymentMethod } from "@/types";

export async function submitPrescriptionOrder(formData: FormData) {
  const session = await auth();

  const medicinesNote = String(formData.get("medicinesNote") ?? "");
  const prescriptionUrl = String(formData.get("prescriptionUrl") ?? "");
  const prescriptionFileName = String(
    formData.get("prescriptionFileName") ?? "",
  );
  const prescriptionMimeType = String(
    formData.get("prescriptionMimeType") ?? "",
  );
  const customerName = String(formData.get("customerName") ?? "");
  const customerPhone = String(formData.get("customerPhone") ?? "");
  const customerEmail = String(formData.get("customerEmail") ?? "");
  const addressLabel = String(formData.get("addressLabel") ?? "home");
  const addressCustomLabel = String(formData.get("addressCustomLabel") ?? "");
  const addressLine = String(formData.get("addressLine") ?? "");
  const area = String(formData.get("area") ?? "");
  const city = String(formData.get("city") ?? "");

  try {
    const request = await createPrescriptionRequest({
      userId: session?.user?.id,
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      addressLabel,
      addressCustomLabel: addressCustomLabel || undefined,
      addressLine,
      area,
      city,
      prescriptionUrl,
      prescriptionFileName: prescriptionFileName || undefined,
      prescriptionMimeType: prescriptionMimeType || undefined,
      medicinesNote: medicinesNote || undefined,
    });

    revalidatePath("/admin", "layout");
    revalidatePath("/admin/prescription-requests");
    return { ok: true as const, requestNumber: request.requestNumber, id: request.id };
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof Error
          ? error.message
          : "Could not submit your prescription request",
    };
  }
}

export async function markPrescriptionRequestInProgress(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    redirectWithFlash("/admin/prescription-requests", {
      error: "Request not found",
    });
  }
  await updatePrescriptionRequestStatus(id, "in_progress");
  revalidatePath("/admin/prescription-requests");
  revalidatePath(`/admin/prescription-requests/${id}`);
  revalidatePath("/admin", "layout");
  redirectWithFlash(`/admin/prescription-requests/${id}`, { saved: true });
}

export async function rejectPrescriptionRequest(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const note = String(formData.get("adminNote") ?? "").trim();
  if (!id) {
    redirectWithFlash("/admin/prescription-requests", {
      error: "Request not found",
    });
  }
  if (note.length < 3) {
    redirectWithFlash(`/admin/prescription-requests/${id}`, {
      error: "Add a short reason for rejection",
    });
  }
  await updatePrescriptionRequestStatus(id, "rejected", note);
  revalidatePath("/admin/prescription-requests");
  revalidatePath(`/admin/prescription-requests/${id}`);
  revalidatePath("/admin", "layout");
  redirectWithFlash(`/admin/prescription-requests/${id}`, { saved: true });
}

export async function fulfillPrescriptionRequestAction(formData: FormData) {
  await requireAdmin();
  const requestId = String(formData.get("requestId") ?? "").trim();
  const paymentMethod = String(
    formData.get("paymentMethod") ?? "cash_on_delivery",
  ) as PaymentMethod;
  const paymentReference = String(formData.get("paymentReference") ?? "");
  const adminNote = String(formData.get("adminNote") ?? "");
  const itemsJson = String(formData.get("itemsJson") ?? "[]");

  let items: FulfillLine[] = [];
  try {
    const parsed = JSON.parse(itemsJson) as FulfillLine[];
    items = Array.isArray(parsed) ? parsed : [];
  } catch {
    redirectWithFlash(`/admin/prescription-requests/${requestId}`, {
      error: "Invalid product list",
    });
  }

  if (!requestId) {
    redirectWithFlash("/admin/prescription-requests", {
      error: "Request not found",
    });
  }

  try {
    const order = await fulfillPrescriptionRequest({
      requestId,
      items,
      paymentMethod,
      paymentReference: paymentReference || undefined,
      adminNote: adminNote || undefined,
    });
    revalidatePath("/admin/prescription-requests");
    revalidatePath(`/admin/prescription-requests/${requestId}`);
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${order.id}`);
    revalidatePath("/admin", "layout");
    redirectWithFlash(`/admin/orders/${order.id}`, { saved: true });
  } catch (error) {
    redirectWithFlash(`/admin/prescription-requests/${requestId}`, {
      error:
        error instanceof Error
          ? error.message
          : "Could not create order from this prescription",
    });
  }
}
