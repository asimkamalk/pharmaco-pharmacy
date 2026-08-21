"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { redirectWithFlash } from "@/lib/admin-flash";
import { prisma } from "@/lib/prisma";
import { getFormFile, saveUploadedImage } from "@/lib/upload";

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function num(formData: FormData, key: string, fallback = 0) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

function isUsableImageUrl(url: string) {
  return Boolean(url) && !url.includes("placeholder");
}

function heroErrorPath(id: string) {
  return id ? `/admin/hero?edit=${encodeURIComponent(id)}` : "/admin/hero";
}

export async function saveHeroSlide(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const back = heroErrorPath(id);

  let backgroundUrl = str(formData, "backgroundUrl");
  try {
    const file = getFormFile(formData, "background");
    if (file) {
      backgroundUrl = await saveUploadedImage(file, "site");
    }
  } catch (err) {
    redirectWithFlash(back, {
      error:
        err instanceof Error
          ? err.message
          : "Could not upload the background image",
      edit: id || undefined,
    });
  }

  if (!isUsableImageUrl(backgroundUrl)) {
    redirectWithFlash(back, {
      error: "Please upload a background image for this slide",
      edit: id || undefined,
    });
  }

  const headline = str(formData, "headline");
  if (!headline) {
    redirectWithFlash(back, {
      error: "Headline is required",
      edit: id || undefined,
    });
  }

  const data = {
    eyebrow: str(formData, "eyebrow"),
    headline: headline || "Your health, delivered with care",
    subcopy: str(formData, "subcopy"),
    ctaLabel: str(formData, "ctaLabel") || "Shop now",
    ctaHref: str(formData, "ctaHref") || "/shop",
    ctaSecondaryLabel: str(formData, "ctaSecondaryLabel"),
    ctaSecondaryHref: str(formData, "ctaSecondaryHref"),
    backgroundUrl,
    sortOrder: num(formData, "sortOrder", 0),
    isActive:
      formData.get("isActive") === "on" || formData.get("isActive") === "true",
  };

  if (id) {
    await prisma.heroSlide.update({ where: { id }, data });
  } else {
    const count = await prisma.heroSlide.count();
    await prisma.heroSlide.create({
      data: { ...data, sortOrder: data.sortOrder || count },
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/hero");
  redirectWithFlash("/admin/hero", { saved: true });
}

export async function deleteHeroSlide(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (!id) {
    redirectWithFlash("/admin/hero", { error: "Slide not found" });
  }
  await prisma.heroSlide.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/hero");
  redirectWithFlash("/admin/hero", { saved: true });
}
