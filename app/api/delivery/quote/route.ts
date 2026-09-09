import { NextResponse } from "next/server";
import { resolveDeliveryFee } from "@/lib/delivery";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city")?.trim() ?? "";
  const area = searchParams.get("area")?.trim() ?? "";
  const phase = searchParams.get("phase")?.trim() ?? "";
  const subtotal = Number(searchParams.get("subtotal") ?? 0);

  if (!city) {
    return NextResponse.json(
      { error: "city is required" },
      { status: 400 },
    );
  }

  const quote = await resolveDeliveryFee({
    city,
    area,
    phase: phase || undefined,
    subtotal: Number.isFinite(subtotal) ? Math.max(0, subtotal) : 0,
  });

  return NextResponse.json(quote);
}
