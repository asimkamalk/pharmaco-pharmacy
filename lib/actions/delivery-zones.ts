"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { firstZodMessage, redirectWithFlash } from "@/lib/admin-flash";
import { prisma } from "@/lib/prisma";

const zoneSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(2, "Label is required").max(120),
  city: z.string().trim().min(2, "City is required").max(80),
  area: z.string().trim().max(120).optional(),
  fee: z.coerce.number().min(0, "Fee must be 0 or more"),
  freeDeliveryAbove: z.coerce.number().min(0).optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
  isActive: z.coerce.boolean().optional(),
});

function formBool(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

export async function saveDeliveryZone(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const freeRaw = formData.get("freeDeliveryAbove");
  const parsed = zoneSchema.safeParse({
    id: id || undefined,
    label: formData.get("label"),
    city: formData.get("city"),
    area: formData.get("area") || "",
    fee: formData.get("fee"),
    freeDeliveryAbove:
      freeRaw === null || freeRaw === "" ? undefined : freeRaw,
    sortOrder: formData.get("sortOrder") || 0,
    isActive: formBool(formData, "isActive"),
  });

  if (!parsed.success) {
    redirectWithFlash("/admin/delivery-zones", {
      error: firstZodMessage(parsed.error.issues),
    });
  }

  const data = parsed.data;
  const payload = {
    label: data.label,
    city: data.city,
    area: data.area?.trim() || "",
    fee: data.fee,
    freeDeliveryAbove:
      data.freeDeliveryAbove === undefined ? null : data.freeDeliveryAbove,
    sortOrder: data.sortOrder ?? 0,
    isActive: data.isActive ?? true,
  };

  try {
    if (id) {
      await prisma.deliveryZone.update({ where: { id }, data: payload });
    } else {
      await prisma.deliveryZone.create({ data: payload });
    }
  } catch {
    redirectWithFlash("/admin/delivery-zones", {
      error: "Could not save delivery zone",
    });
  }

  revalidatePath("/admin/delivery-zones");
  revalidatePath("/admin/settings");
  redirectWithFlash("/admin/delivery-zones", { saved: true });
}

export async function deleteDeliveryZone(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    redirectWithFlash("/admin/delivery-zones", { error: "Zone not found" });
  }
  try {
    await prisma.deliveryZone.delete({ where: { id } });
  } catch {
    redirectWithFlash("/admin/delivery-zones", {
      error: "Could not delete zone",
    });
  }
  revalidatePath("/admin/delivery-zones");
  redirectWithFlash("/admin/delivery-zones", { saved: true });
}
