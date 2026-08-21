"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { redirectWithFlash } from "@/lib/admin-flash";
import { prisma } from "@/lib/prisma";
import { getFormFile, saveUploadedPrescription } from "@/lib/upload";

export async function uploadPrescription(formData: FormData) {
  const file = getFormFile(formData, "prescription");
  if (!file) {
    throw new Error("Please choose a prescription photo or PDF");
  }
  return saveUploadedPrescription(file);
}

export async function setPrescriptionReview(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as
    | "approved"
    | "rejected";
  const note = String(formData.get("note") ?? "").trim();

  if (!orderId) {
    redirectWithFlash("/admin/orders", { error: "Order not found" });
  }
  if (status !== "approved" && status !== "rejected") {
    redirectWithFlash(`/admin/orders/${orderId}`, {
      error: "Choose approve or reject",
    });
  }
  if (status === "rejected" && note.length < 3) {
    redirectWithFlash(`/admin/orders/${orderId}`, {
      error: "Add a short note explaining why the prescription was rejected",
    });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, prescriptionStatus: true },
  });
  if (!order || order.prescriptionStatus === "not_required") {
    redirectWithFlash(`/admin/orders/${orderId}`, {
      error: "This order has no prescription to review",
    });
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      prescriptionStatus: status,
      prescriptionAdminNote: note || null,
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin", "layout");
  revalidatePath("/account/orders");
  redirectWithFlash(`/admin/orders/${orderId}`, { saved: true });
}
