"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { sanitizeProductHtml } from "@/lib/sanitize";
import { ensureSiteSettings } from "@/lib/site";
import { saveUploadedImage } from "@/lib/upload";

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

  let logoUrl = str(formData, "logoUrl") || "/images/pharmaco-logo-text.png";
  const logoFile = formData.get("logo");
  if (logoFile instanceof File && logoFile.size > 0) {
    logoUrl = await saveUploadedImage(logoFile, "site");
  }

  await prisma.siteSettings.update({
    where: { id: "default" },
    data: {
      name: str(formData, "name") || "Pharmaco Pharmacy",
      shortName: str(formData, "shortName") || "Pharmaco",
      tagline: str(formData, "tagline"),
      description: str(formData, "description"),
      area: str(formData, "area"),
      city: str(formData, "city"),
      country: str(formData, "country"),
      address: str(formData, "address"),
      phone: str(formData, "phone"),
      whatsapp: str(formData, "whatsapp"),
      email: str(formData, "email"),
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
  redirect("/admin/settings?saved=1");
}

export async function saveHomepageSettings(formData: FormData) {
  await requireAdmin();
  await ensureSiteSettings();

  const whyChoose = [1, 2, 3, 4].map((index) => ({
    title: str(formData, `whyTitle${index}`),
    description: str(formData, `whyDescription${index}`),
  })).filter((item) => item.title);

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
      promoHeadline: str(formData, "promoHeadline"),
      promoSubcopy: str(formData, "promoSubcopy"),
      whyChooseJson: JSON.stringify(whyChoose),
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/homepage");
  redirect("/admin/homepage?saved=1");
}

export async function saveCmsPage(formData: FormData) {
  await requireAdmin();
  const slug = str(formData, "slug");
  const title = str(formData, "title");
  const bodyHtml = sanitizeProductHtml(str(formData, "bodyHtml"));
  const isPublished =
    formData.get("isPublished") === "on" ||
    formData.get("isPublished") === "true";

  if (!slug || !title) throw new Error("Slug and title are required");

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
  redirect(`/admin/pages/${slug}?saved=1`);
}
