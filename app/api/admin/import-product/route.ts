import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rebrandCatalogText, rebrandSku } from "@/lib/rebrand-text";
import {
  deriveStripPricing,
  parsePackFromTitle,
} from "@/lib/pack-from-title";

export const runtime = "nodejs";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 180);
}

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

const bodySchema = z.object({
  title: z.string().trim().min(1).max(300),
  slug: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional().default(""),
  price: z.number().finite().nonnegative(),
  originalPrice: z.number().finite().nonnegative().optional(),
  brand: z.string().trim().min(1).max(200).optional().default("Unbranded"),
  category: z.string().trim().min(1).max(200).optional().default("General"),
  imageUrl: z.string().trim().optional(),
  sku: z.string().trim().min(1).max(100).optional(),
  stock: z.number().int().nonnegative().optional(),
  requiresPrescription: z.boolean().optional(),
  sourceId: z.string().trim().max(100).optional(),
});

/**
 * MVP import endpoint used by `scripts/import-dvago.ts`.
 * Auth: `x-api-secret` must match `ADMIN_SECRET_KEY`.
 */
export async function POST(request: Request) {
  const unauthorized = assertSecret(request);
  if (unauthorized) return unauthorized;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const pack = parsePackFromTitle(data.title);
  const cleanTitle = pack.cleanName || data.title.trim();
  const productSlug = slugify(data.slug || cleanTitle || data.title);
  const brandTitle = data.brand || "Unbranded";
  const categoryTitle = data.category || "General";
  const brandSlug = slugify(brandTitle) || "unbranded";
  const categorySlug = slugify(categoryTitle) || "general";
  const sku = rebrandSku(
    data.sku?.trim() ||
      (data.sourceId ? `pharmaco-${data.sourceId}` : `sku-${productSlug}`),
  );
  const description = rebrandCatalogText(data.description ?? "");
  const stock = data.stock ?? 0;

  const listPrice =
    data.originalPrice && data.originalPrice > data.price
      ? data.originalPrice
      : data.price;
  const discount =
    listPrice > 0 && data.price < listPrice
      ? Math.min(
          100,
          Math.max(0, Math.round((1 - data.price / listPrice) * 100)),
        )
      : 0;

  const basePurchase = Math.round(data.price * 0.8 * 100) / 100;
  const pricing = pack.sellByStrip
    ? deriveStripPricing({
        listPrice,
        purchasePrice: basePurchase,
        stripsPerBox: pack.stripsPerBox ?? 1,
        priceIsPerStrip: pack.priceIsPerStrip,
      })
    : {
        price: listPrice,
        stripPrice: null as number | null,
        purchasePrice: basePurchase,
        stripPurchasePrice: null as number | null,
      };

  const rawImage = (data.imageUrl || "").trim();
  const imageUrl =
    rawImage.startsWith("https://") || rawImage.startsWith("http://")
      ? rawImage
      : "/images/products/placeholder.svg";

  try {
    const category = await prisma.category.upsert({
      where: { slug: categorySlug },
      create: {
        title: categoryTitle,
        slug: categorySlug,
        description: "",
        image: "/images/categories/placeholder.svg",
      },
      update: { title: categoryTitle, isActive: true },
    });

    const brand = await prisma.brand.upsert({
      where: { slug: brandSlug },
      create: {
        title: brandTitle,
        slug: brandSlug,
        description: "",
        image: "/images/brands/placeholder.svg",
      },
      update: { title: brandTitle, isActive: true },
    });

    const existingBySku = await prisma.product.findUnique({ where: { sku } });
    const existingBySlug = existingBySku
      ? null
      : await prisma.product.findUnique({ where: { slug: productSlug } });
    const existing = existingBySku ?? existingBySlug;

    const payload = {
      name: cleanTitle,
      slug: existing?.slug ?? productSlug,
      description: description.slice(0, 500),
      longDescription: description
        ? `<p>${description.replace(/</g, "&lt;")}</p>`
        : "",
      metaDescription: description.slice(0, 160),
      sku,
      purchasePrice: pricing.purchasePrice,
      price: pricing.price,
      discount,
      stock,
      requiresPrescription: false,
      categoryId: category.id,
      brandId: brand.id,
      isArchived: false,
      manufacturer: brandTitle,
      dosageForm: pack.dosageForm,
      sellByStrip: pack.sellByStrip,
      unitsPerStrip: pack.unitsPerStrip,
      stripsPerBox: pack.stripsPerBox,
      stripPrice: pricing.stripPrice,
      stripPurchasePrice: pricing.stripPurchasePrice,
    };

    let productId: string;
    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: payload,
      });
      productId = existing.id;
      await prisma.productImage.deleteMany({ where: { productId } });
    } else {
      const created = await prisma.product.create({ data: payload });
      productId = created.id;
    }

    await prisma.productImage.create({
      data: {
        productId,
        url: imageUrl,
        alt: cleanTitle,
        sortOrder: 0,
      },
    });

    return NextResponse.json({
      ok: true,
      productId,
      slug: payload.slug,
      brand: brand.slug,
      category: category.slug,
      updated: Boolean(existing),
    });
  } catch (err) {
    console.error("[import-product]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to upsert product",
      },
      { status: 500 },
    );
  }
}
