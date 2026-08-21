import { prisma } from "@/lib/prisma";
import {
  defaultSiteConfig,
  type SiteConfig,
  type WhyChooseItem,
} from "@/constants/site";
import { unstable_noStore as noStore } from "next/cache";

function parseWhyChoose(json: string): WhyChooseItem[] {
  try {
    const parsed = JSON.parse(json) as WhyChooseItem[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    /* fall through */
  }
  return defaultSiteConfig.home.whyChoose;
}

export function mapSettingsToConfig(row: {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  area: string;
  city: string;
  country: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  openingHours: string;
  deliveryStandardFee: number;
  freeDeliveryAbove: number;
  deliveryEstimate: string;
  bankName: string;
  bankAccountTitle: string;
  bankAccountNumber: string;
  bankIban: string;
  easyPaisaTitle: string;
  easyPaisaNumber: string;
  jazzCashTitle: string;
  jazzCashNumber: string;
  mapEmbedUrl: string;
  mapLinkUrl: string;
  logoUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  twitterUrl: string;
  seoTitle: string;
  seoDescription: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroSubcopy: string;
  heroCtaPrimaryLabel: string;
  heroCtaPrimaryHref: string;
  heroCtaSecondaryLabel: string;
  heroCtaSecondaryHref: string;
  heroBackgroundUrl: string;
  heroImageUrl: string;
  promoHeadline: string;
  promoSubcopy: string;
  whyChooseJson: string;
  rxOrderHeadline: string;
  rxOrderSubcopy: string;
  rxOrderStep1: string;
  rxOrderStep2: string;
  rxOrderStep3: string;
  rxOrderCtaLabel: string;
}): SiteConfig {
  const d = defaultSiteConfig;
  return {
    name: row.name || d.name,
    shortName: row.shortName || d.shortName,
    tagline: row.tagline || d.tagline,
    description: row.description || d.description,
    location: {
      area: row.area || d.location.area,
      city: row.city || d.location.city,
      country: row.country || d.location.country,
      address: row.address || d.location.address,
    },
    contact: {
      phone: row.phone || d.contact.phone,
      whatsapp: row.whatsapp || d.contact.whatsapp,
      email: row.email || d.contact.email,
      openingHours: row.openingHours || d.contact.openingHours,
    },
    delivery: {
      standardFee: row.deliveryStandardFee ?? d.delivery.standardFee,
      freeDeliveryAbove: row.freeDeliveryAbove ?? d.delivery.freeDeliveryAbove,
      estimate: row.deliveryEstimate || d.delivery.estimate,
    },
    payments: {
      bankTransfer: {
        bankName: row.bankName || d.payments.bankTransfer.bankName,
        accountTitle:
          row.bankAccountTitle || d.payments.bankTransfer.accountTitle,
        accountNumber:
          row.bankAccountNumber || d.payments.bankTransfer.accountNumber,
        iban: row.bankIban || d.payments.bankTransfer.iban,
      },
      easyPaisa: {
        accountTitle:
          row.easyPaisaTitle || d.payments.easyPaisa.accountTitle,
        mobileNumber:
          row.easyPaisaNumber || d.payments.easyPaisa.mobileNumber,
      },
      jazzCash: {
        accountTitle: row.jazzCashTitle || d.payments.jazzCash.accountTitle,
        mobileNumber: row.jazzCashNumber || d.payments.jazzCash.mobileNumber,
      },
    },
    map: {
      embedUrl: row.mapEmbedUrl || d.map.embedUrl,
      linkUrl: row.mapLinkUrl || d.map.linkUrl,
    },
    branding: {
      logoUrl: row.logoUrl || d.branding.logoUrl,
    },
    social: {
      facebook: row.facebookUrl || d.social.facebook,
      instagram: row.instagramUrl || d.social.instagram,
      tiktok: row.tiktokUrl || d.social.tiktok,
      twitter: row.twitterUrl || d.social.twitter,
    },
    seo: {
      title: row.seoTitle || d.seo.title,
      description: row.seoDescription || d.seo.description,
    },
    home: {
      heroEyebrow: row.heroEyebrow || `${row.name || d.name} — ${row.area || d.location.area}, ${row.city || d.location.city}`,
      heroHeadline: row.heroHeadline || d.home.heroHeadline,
      heroSubcopy: row.heroSubcopy || d.home.heroSubcopy,
      heroCtaPrimaryLabel: row.heroCtaPrimaryLabel || d.home.heroCtaPrimaryLabel,
      heroCtaPrimaryHref: row.heroCtaPrimaryHref || d.home.heroCtaPrimaryHref,
      heroCtaSecondaryLabel:
        row.heroCtaSecondaryLabel || d.home.heroCtaSecondaryLabel,
      heroCtaSecondaryHref:
        row.heroCtaSecondaryHref || d.home.heroCtaSecondaryHref,
      heroBackgroundUrl: row.heroBackgroundUrl || "",
      heroImageUrl: row.heroImageUrl || d.home.heroImageUrl,
      promoHeadline: row.promoHeadline || d.home.promoHeadline,
      promoSubcopy: row.promoSubcopy || d.home.promoSubcopy,
      whyChoose: parseWhyChoose(row.whyChooseJson),
      rxOrderHeadline: row.rxOrderHeadline || d.home.rxOrderHeadline,
      rxOrderSubcopy: row.rxOrderSubcopy || d.home.rxOrderSubcopy,
      rxOrderSteps: [
        row.rxOrderStep1 || d.home.rxOrderSteps[0],
        row.rxOrderStep2 || d.home.rxOrderSteps[1],
        row.rxOrderStep3 || d.home.rxOrderSteps[2],
      ],
      rxOrderCtaLabel: row.rxOrderCtaLabel || d.home.rxOrderCtaLabel,
    },
  };
}

export async function getSiteConfig(): Promise<SiteConfig> {
  noStore();
  try {
    const row = await ensureSiteSettings();
    return mapSettingsToConfig(row);
  } catch {
    return defaultSiteConfig;
  }
}

export async function getCmsPage(slug: string) {
  noStore();
  try {
    return await prisma.cmsPage.findFirst({
      where: { slug, isPublished: true },
    });
  } catch {
    return null;
  }
}

export async function ensureSiteSettings() {
  const existing = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });
  const d = defaultSiteConfig;

  if (!existing) {
    return prisma.siteSettings.create({
      data: {
        id: "default",
        name: d.name,
        shortName: d.shortName,
        tagline: d.tagline,
        description: d.description,
        area: d.location.area,
        city: d.location.city,
        country: d.location.country,
        address: d.location.address,
        phone: d.contact.phone,
        whatsapp: d.contact.whatsapp,
        email: d.contact.email,
        openingHours: d.contact.openingHours,
        deliveryStandardFee: d.delivery.standardFee,
        freeDeliveryAbove: d.delivery.freeDeliveryAbove,
        deliveryEstimate: d.delivery.estimate,
        bankName: d.payments.bankTransfer.bankName,
        bankAccountTitle: d.payments.bankTransfer.accountTitle,
        bankAccountNumber: d.payments.bankTransfer.accountNumber,
        bankIban: d.payments.bankTransfer.iban,
        easyPaisaTitle: d.payments.easyPaisa.accountTitle,
        easyPaisaNumber: d.payments.easyPaisa.mobileNumber,
        jazzCashTitle: d.payments.jazzCash.accountTitle,
        jazzCashNumber: d.payments.jazzCash.mobileNumber,
        mapEmbedUrl: d.map.embedUrl,
        mapLinkUrl: d.map.linkUrl,
        logoUrl: d.branding.logoUrl,
        facebookUrl: d.social.facebook,
        instagramUrl: d.social.instagram,
        tiktokUrl: d.social.tiktok,
        twitterUrl: d.social.twitter,
        seoTitle: d.seo.title,
        seoDescription: d.seo.description,
        heroEyebrow: d.home.heroEyebrow,
        heroHeadline: d.home.heroHeadline,
        heroSubcopy: d.home.heroSubcopy,
        heroCtaPrimaryLabel: d.home.heroCtaPrimaryLabel,
        heroCtaPrimaryHref: d.home.heroCtaPrimaryHref,
        heroCtaSecondaryLabel: d.home.heroCtaSecondaryLabel,
        heroCtaSecondaryHref: d.home.heroCtaSecondaryHref,
        heroBackgroundUrl: d.home.heroBackgroundUrl,
        heroImageUrl: d.home.heroImageUrl,
        promoHeadline: d.home.promoHeadline,
        promoSubcopy: d.home.promoSubcopy,
        whyChooseJson: JSON.stringify(d.home.whyChoose),
        rxOrderHeadline: d.home.rxOrderHeadline,
        rxOrderSubcopy: d.home.rxOrderSubcopy,
        rxOrderStep1: d.home.rxOrderSteps[0],
        rxOrderStep2: d.home.rxOrderSteps[1],
        rxOrderStep3: d.home.rxOrderSteps[2],
        rxOrderCtaLabel: d.home.rxOrderCtaLabel,
      },
    });
  }

  // Backfill NAP / map / SEO / 24-7 hours when still on placeholder values
  const oldHours = "Mon – Sun: 9:00 AM – 11:00 PM";
  const oldEstimate =
    "Same-day delivery within Hayatabad, 1–2 days across Peshawar";
  const needsHoursUpdate =
    existing.openingHours === oldHours ||
    existing.deliveryEstimate === oldEstimate;
  const needsNapUpdate =
    existing.address.includes("[") ||
    existing.phone.includes("XXX") ||
    existing.email.includes("example.com") ||
    !existing.mapLinkUrl.includes("maps.app.goo.gl/RRzaApoHHqsozbdy8") ||
    !existing.mapEmbedUrl.includes("0x38d911005f142e31");
  const needsRxOrderBackfill =
    !existing.rxOrderHeadline?.trim() ||
    !existing.rxOrderSubcopy?.trim() ||
    !existing.rxOrderStep1?.trim();

  if (!needsNapUpdate && !needsHoursUpdate && !needsRxOrderBackfill) {
    return existing;
  }

  return prisma.siteSettings.update({
    where: { id: "default" },
    data: {
      ...(needsNapUpdate
        ? {
            address: d.location.address,
            phone: d.contact.phone,
            whatsapp: d.contact.whatsapp,
            email: existing.email.includes("example.com")
              ? d.contact.email
              : existing.email,
            mapEmbedUrl: d.map.embedUrl,
            mapLinkUrl: d.map.linkUrl,
            seoTitle: d.seo.title,
            seoDescription: d.seo.description,
            easyPaisaNumber: existing.easyPaisaNumber.includes("X")
              ? d.payments.easyPaisa.mobileNumber
              : existing.easyPaisaNumber,
            jazzCashNumber: existing.jazzCashNumber.includes("X")
              ? d.payments.jazzCash.mobileNumber
              : existing.jazzCashNumber,
          }
        : {}),
      ...(needsHoursUpdate
        ? {
            openingHours:
              existing.openingHours === oldHours
                ? d.contact.openingHours
                : existing.openingHours,
            deliveryEstimate:
              existing.deliveryEstimate === oldEstimate
                ? d.delivery.estimate
                : existing.deliveryEstimate,
          }
        : {}),
      ...(needsRxOrderBackfill
        ? {
            rxOrderHeadline:
              existing.rxOrderHeadline?.trim() || d.home.rxOrderHeadline,
            rxOrderSubcopy:
              existing.rxOrderSubcopy?.trim() || d.home.rxOrderSubcopy,
            rxOrderStep1:
              existing.rxOrderStep1?.trim() || d.home.rxOrderSteps[0],
            rxOrderStep2:
              existing.rxOrderStep2?.trim() || d.home.rxOrderSteps[1],
            rxOrderStep3:
              existing.rxOrderStep3?.trim() || d.home.rxOrderSteps[2],
            rxOrderCtaLabel:
              existing.rxOrderCtaLabel?.trim() || d.home.rxOrderCtaLabel,
          }
        : {}),
    },
  });
}
