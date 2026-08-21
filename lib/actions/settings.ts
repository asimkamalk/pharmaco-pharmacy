"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { redirectWithFlash } from "@/lib/admin-flash";
import { prisma } from "@/lib/prisma";
import { sanitizeProductHtml } from "@/lib/sanitize";
import { ensureSiteSettings } from "@/lib/site";
import { getFormFile, saveUploadedImage } from "@/lib/upload";

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function num(formData: FormData, key: string, fallback = 0) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

export async function saveSiteSettings(formData: FormData) {
  await requireAdmin();
  await ensureSiteSettings();

  const name = str(formData, "name");
  const phone = str(formData, "phone");
  const email = str(formData, "email");
  if (!name) {
    redirectWithFlash("/admin/settings", { error: "Store name is required" });
  }
  if (!phone) {
    redirectWithFlash("/admin/settings", { error: "Phone number is required" });
  }
  if (!email) {
    redirectWithFlash("/admin/settings", { error: "Email is required" });
  }

  let logoUrl = str(formData, "logoUrl") || "/images/pharmaco-logo-text.png";
  try {
    const logoFile = getFormFile(formData, "logo");
    if (logoFile) {
      logoUrl = await saveUploadedImage(logoFile, "site");
    }
  } catch (err) {
    redirectWithFlash("/admin/settings", {
      error: err instanceof Error ? err.message : "Could not upload the logo",
    });
  }

  await prisma.siteSettings.update({
    where: { id: "default" },
    data: {
      name: name || "Pharmaco Pharmacy",
      shortName: str(formData, "shortName") || "Pharmaco",
      tagline: str(formData, "tagline"),
      description: str(formData, "description"),
      area: str(formData, "area"),
      city: str(formData, "city"),
      country: str(formData, "country"),
      address: str(formData, "address"),
      phone,
      whatsapp: str(formData, "whatsapp"),
      email,
      openingHours: str(formData, "openingHours"),
      deliveryStandardFee: num(formData, "deliveryStandardFee", 150),
      freeDeliveryAbove: num(formData, "freeDeliveryAbove", 2000),
      deliveryEstimate: str(formData, "deliveryEstimate"),
      bankName: str(formData, "bankName"),
      bankAccountTitle: str(formData, "bankAccountTitle"),
      bankAccountNumber: str(formData, "bankAccountNumber"),
      bankIban: str(formData, "bankIban"),
      easyPaisaTitle: str(formData, "easyPaisaTitle"),
      easyPaisaNumber: str(formData, "easyPaisaNumber"),
      jazzCashTitle: str(formData, "jazzCashTitle"),
      jazzCashNumber: str(formData, "jazzCashNumber"),
      mapEmbedUrl: str(formData, "mapEmbedUrl"),
      mapLinkUrl: str(formData, "mapLinkUrl"),
      logoUrl,
      facebookUrl: str(formData, "facebookUrl"),
      instagramUrl: str(formData, "instagramUrl"),
      tiktokUrl: str(formData, "tiktokUrl"),
      twitterUrl: str(formData, "twitterUrl"),
      seoTitle: str(formData, "seoTitle"),
      seoDescription: str(formData, "seoDescription"),
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  redirectWithFlash("/admin/settings", { saved: true });
}

export async function saveHeroSettings(formData: FormData) {
  await requireAdmin();
  await ensureSiteSettings();

  let heroBackgroundUrl = str(formData, "heroBackgroundUrl");
  if (!heroBackgroundUrl || heroBackgroundUrl.includes("placeholder.svg")) {
    heroBackgroundUrl = "";
  }
  let heroImageUrl =
    str(formData, "heroImageUrl") || "/images/pharmaco-logo.png";

  try {
    const backgroundFile = getFormFile(formData, "heroBackground");
    if (backgroundFile) {
      heroBackgroundUrl = await saveUploadedImage(backgroundFile, "site");
    }

    const sideFile = getFormFile(formData, "heroImage");
    if (sideFile) {
      heroImageUrl = await saveUploadedImage(sideFile, "site");
    }
  } catch (err) {
    redirectWithFlash("/admin/hero", {
      error:
        err instanceof Error ? err.message : "Could not upload hero image",
    });
  }

  if (formData.get("clearBackground") === "on") {
    heroBackgroundUrl = "";
  }

  await prisma.siteSettings.update({
    where: { id: "default" },
    data: {
      heroEyebrow: str(formData, "heroEyebrow"),
      heroHeadline: str(formData, "heroHeadline"),
      heroSubcopy: str(formData, "heroSubcopy"),
      heroCtaPrimaryLabel: str(formData, "heroCtaPrimaryLabel"),
      heroCtaPrimaryHref: str(formData, "heroCtaPrimaryHref"),
      heroCtaSecondaryLabel: str(formData, "heroCtaSecondaryLabel"),
      heroCtaSecondaryHref: str(formData, "heroCtaSecondaryHref"),
      heroBackgroundUrl,
      heroImageUrl,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/hero");
  redirectWithFlash("/admin/hero", { saved: true });
}

export async function saveHomepageSettings(formData: FormData) {
  await requireAdmin();
  await ensureSiteSettings();

  const whyChoose = [1, 2, 3, 4]
    .map((index) => ({
      title: str(formData, `whyTitle${index}`),
      description: str(formData, `whyDescription${index}`),
    }))
    .filter((item) => item.title);

  await prisma.siteSettings.update({
    where: { id: "default" },
    data: {
      promoHeadline: str(formData, "promoHeadline"),
      promoSubcopy: str(formData, "promoSubcopy"),
      whyChooseJson: JSON.stringify(whyChoose),
      rxOrderHeadline: str(formData, "rxOrderHeadline"),
      rxOrderSubcopy: str(formData, "rxOrderSubcopy"),
      rxOrderStep1: str(formData, "rxOrderStep1"),
      rxOrderStep2: str(formData, "rxOrderStep2"),
      rxOrderStep3: str(formData, "rxOrderStep3"),
      rxOrderCtaLabel: str(formData, "rxOrderCtaLabel") || "Order by prescription",
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/homepage");
  redirectWithFlash("/admin/homepage", { saved: true });
}

export async function saveCmsPage(formData: FormData) {
  await requireAdmin();
  const slug = str(formData, "slug");
  const title = str(formData, "title");
  const bodyHtml = sanitizeProductHtml(str(formData, "bodyHtml"));
  const isPublished =
    formData.get("isPublished") === "on" ||
    formData.get("isPublished") === "true";

  if (!slug || !title) {
    redirectWithFlash(slug ? `/admin/pages/${slug}` : "/admin/pages", {
      error: "Title is required",
    });
  }

  await prisma.cmsPage.upsert({
    where: { slug },
    update: { title, bodyHtml, isPublished },
    create: { slug, title, bodyHtml, isPublished },
  });

  revalidatePath(`/${slug === "about" ? "about" : slug}`);
  revalidatePath("/privacy");
  revalidatePath("/terms");
  revalidatePath("/about");
  revalidatePath("/admin/pages");
  redirectWithFlash(`/admin/pages/${slug}`, { saved: true });
}
