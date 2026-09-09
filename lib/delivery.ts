import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/site";

export type DeliveryZoneRow = {
  id: string;
  label: string;
  city: string;
  area: string;
  fee: number;
  freeDeliveryAbove: number | null;
  isActive: boolean;
  sortOrder: number;
};

export type DeliveryQuote = {
  fee: number;
  standardFee: number;
  freeDeliveryAbove: number;
  isFree: boolean;
  zoneLabel: string | null;
  matchedBy: "area" | "city" | "default";
};

function norm(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function listDeliveryZones(includeInactive = false) {
  return prisma.deliveryZone.findMany({
    where: includeInactive ? undefined : { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { city: "asc" }, { area: "asc" }],
  });
}

export function matchDeliveryZone(
  zones: DeliveryZoneRow[],
  city: string,
  area: string,
  phase?: string,
): { zone: DeliveryZoneRow; matchedBy: "area" | "city" } | null {
  const c = norm(city);
  const a = norm(area);
  const p = phase ? norm(phase) : "";
  const active = zones.filter((zone) => zone.isActive);
  if (!c) return null;

  // Prefer explicit phase zones (Hayatabad Phase 2 / Phase 2)
  if (p) {
    const phaseExact = active.find((zone) => {
      if (norm(zone.city) !== c || !zone.area.trim()) return false;
      const za = norm(zone.area);
      return za === p || za === `hayatabad ${p}` || za.endsWith(p);
    });
    if (phaseExact) return { zone: phaseExact, matchedBy: "area" };
  }

  const searchArea = p && !a.includes(p) ? `${a} ${p}`.trim() : a;

  const exactArea = active.find(
    (zone) =>
      norm(zone.city) === c &&
      zone.area.trim() !== "" &&
      norm(zone.area) === searchArea,
  );
  if (exactArea) return { zone: exactArea, matchedBy: "area" };

  const fuzzyArea = active.find((zone) => {
    if (norm(zone.city) !== c || !zone.area.trim() || !searchArea) return false;
    const za = norm(zone.area);
    return searchArea.includes(za) || za.includes(searchArea);
  });
  if (fuzzyArea) return { zone: fuzzyArea, matchedBy: "area" };

  const cityWide = active.find(
    (zone) => norm(zone.city) === c && !zone.area.trim(),
  );
  if (cityWide) return { zone: cityWide, matchedBy: "city" };

  return null;
}

export async function resolveDeliveryFee(input: {
  city: string;
  area: string;
  phase?: string;
  subtotal: number;
}): Promise<DeliveryQuote> {
  const [site, zones] = await Promise.all([
    getSiteConfig(),
    listDeliveryZones(false),
  ]);

  const matched = matchDeliveryZone(
    zones,
    input.city,
    input.area,
    input.phase,
  );
  const standardFee = matched?.zone.fee ?? site.delivery.standardFee;
  const freeDeliveryAbove =
    matched?.zone.freeDeliveryAbove ?? site.delivery.freeDeliveryAbove;
  const isFree = input.subtotal >= freeDeliveryAbove && freeDeliveryAbove > 0;

  return {
    fee: isFree ? 0 : standardFee,
    standardFee,
    freeDeliveryAbove,
    isFree,
    zoneLabel: matched?.zone.label ?? null,
    matchedBy: matched?.matchedBy ?? "default",
  };
}
