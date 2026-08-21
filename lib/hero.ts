import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";
import type { HeroSlideData } from "@/types/hero";

export async function getHeroSlides(): Promise<HeroSlideData[]> {
  noStore();
  try {
    const rows = await prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    if (rows.length > 0) {
      return rows.map((row) => ({
        id: row.id,
        sortOrder: row.sortOrder,
        eyebrow: row.eyebrow,
        headline: row.headline,
        subcopy: row.subcopy,
        ctaLabel: row.ctaLabel,
        ctaHref: row.ctaHref,
        ctaSecondaryLabel: row.ctaSecondaryLabel,
        ctaSecondaryHref: row.ctaSecondaryHref,
        backgroundUrl: row.backgroundUrl,
      }));
    }

    // Fallback: build one slide from legacy SiteSettings hero fields
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });
    if (!settings) return [];

    return [
      {
        id: "legacy",
        sortOrder: 0,
        eyebrow:
          settings.heroEyebrow ||
          `${settings.name} — ${settings.area}, ${settings.city}`,
        headline: settings.heroHeadline || "Your health, delivered with care",
        subcopy: settings.heroSubcopy || "",
        ctaLabel: settings.heroCtaPrimaryLabel || "Shop now",
        ctaHref: settings.heroCtaPrimaryHref || "/shop",
        ctaSecondaryLabel: settings.heroCtaSecondaryLabel || "Contact us",
        ctaSecondaryHref: settings.heroCtaSecondaryHref || "/contact",
        backgroundUrl:
          settings.heroBackgroundUrl || "/images/pharmaco-logo.png",
      },
    ];
  } catch {
    return [];
  }
}

export async function getAllHeroSlidesAdmin() {
  return prisma.heroSlide.findMany({ orderBy: { sortOrder: "asc" } });
}
