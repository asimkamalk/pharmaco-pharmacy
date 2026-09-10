import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function assertSecret(request: Request) {
  const expected = process.env.ADMIN_SECRET_KEY;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_SECRET_KEY is not configured on the server" },
      { status: 500 },
    );
  }
  const provided = request.headers.get("x-api-secret");
  if (!provided || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/**
 * Deletes all products, brands, and categories.
 * Order items keep history with productId set null (schema onDelete: SetNull).
 */
export async function POST(request: Request) {
  const unauthorized = assertSecret(request);
  if (unauthorized) return unauthorized;

  try {
    const images = await prisma.productImage.deleteMany({});
    const products = await prisma.product.deleteMany({});
    const brands = await prisma.brand.deleteMany({});
    const categories = await prisma.category.deleteMany({});

    return NextResponse.json({
      ok: true,
      deleted: {
        images: images.count,
        products: products.count,
        brands: brands.count,
        categories: categories.count,
      },
    });
  } catch (err) {
    console.error("[clear-catalog]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to clear catalog",
      },
      { status: 500 },
    );
  }
}
