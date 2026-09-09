import type { AddressRegion, HayatabadPhase, SavedAddress } from "@/types";

export const HAYATABAD_PHASES: HayatabadPhase[] = [
  "Phase 1",
  "Phase 2",
  "Phase 3",
  "Phase 4",
  "Phase 5",
  "Phase 6",
  "Phase 7",
];

export function isHayatabadArea(area: string) {
  return area.trim().toLowerCase().includes("hayatabad");
}

export function composeHayatabadAddressLine(parts: {
  houseNo: string;
  streetNo: string;
  sectorNo: string;
  phase: string;
}) {
  return `House ${parts.houseNo.trim()}, Street ${parts.streetNo.trim()}, Sector ${parts.sectorNo.trim()}, ${parts.phase.trim()}`;
}

export function extractPhaseFromText(value: string): HayatabadPhase | "" {
  const match = value.match(/phase\s*([1-7])/i);
  if (!match) return "";
  return `Phase ${match[1]}` as HayatabadPhase;
}

export function resolveAddressRegion(
  address: Pick<SavedAddress, "region" | "area" | "phase" | "houseNo">,
): AddressRegion {
  if (address.region === "hayatabad" || address.region === "outside") {
    return address.region;
  }
  if (address.phase || address.houseNo || isHayatabadArea(address.area)) {
    return "hayatabad";
  }
  return "outside";
}
