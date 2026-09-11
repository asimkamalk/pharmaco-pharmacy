/**
 * Direct DVAGO → Neon import (uses local DATABASE_URL).
 * Prefer this when ADMIN_SECRET_KEY is not yet on Vercel.
 *
 *   npx tsx scripts/import-dvago-direct.ts
 *   npx tsx scripts/import-dvago-direct.ts --limit=20
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { rebrandCatalogText } from "../lib/rebrand-text";

const prisma = new PrismaClient();
const DVAGO_API = "https://apidb.dvago.pk";
const BRANCH_CODE = process.env.BRANCH_CODE || "32";
const DELAY_MS = Number(process.env.DELAY_MS || 50);
const PROGRESS_FILE = path.join(process.cwd(), "scripts", "progress.json");

type Progress = {
  processedIds: string[];
  failed: { id: string; error: string }[];
  startedAt: string;
  updatedAt: string;
};

type DvagoProduct = {
  ProductID?: string;
  Slug?: string;
  Title?: string;
  Brand?: string;
  Category?: string;
  ParentCategory?: string;
  ChildCategory?: string;
  Price?: string;
  SalePrice?: string;
  DiscountPrice?: string;
  ProductImage?: string;
  Description?: string;
  MetaDescription?: string;
  AvailableQty?: string;
  PrescriptionRequired?: string;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 180);
}

function toNumber(value: string | undefined, fallback = 0) {
  if (!value) return fallback;
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : fallback;
}

function loadProgress(): Progress {
  if (!fs.existsSync(PROGRESS_FILE)) {
    return {
      processedIds: [],
      failed: [],
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8")) as Progress;
}

function saveProgress(progress: Progress) {
  progress.updatedAt = new Date().toISOString();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function upsertProduct(p: DvagoProduct) {
  const title = (p.Title || "").trim();
  if (!title) throw new Error("missing title");

  const productSlug = slugify(p.Slug || title);
  const brandTitle = (p.Brand || "Unbranded").trim();
  const categoryTitle = (
    p.Category ||
    p.ChildCategory ||
    p.ParentCategory ||
    "General"
  ).trim();
  const brandSlug = slugify(brandTitle) || "unbranded";
  const categorySlug = slugify(categoryTitle) || "general";
  const sku = p.ProductID ? `pharmaco-${p.ProductID}` : `sku-${productSlug}`;

  const sale = toNumber(p.SalePrice ?? p.Price);
  const discountPrice = toNumber(p.DiscountPrice);
  const sellPrice =
    discountPrice > 0 && discountPrice < sale ? discountPrice : sale;
  const listPrice = sale > sellPrice ? sale : sellPrice;
  const discount =
    listPrice > 0 && sellPrice < listPrice
      ? Math.min(
          100,
          Math.max(0, Math.round((1 - sellPrice / listPrice) * 100)),
        )
      : 0;

  const description = rebrandCatalogText(
    (p.Description || p.MetaDescription || "").trim(),
  );
  const rawImage = (p.ProductImage || "").trim();
  const imageUrl =
    rawImage.startsWith("http") &&
    !/dvago-logo|noproductfound|\/assets\/dvago/i.test(rawImage)
      ? rawImage
      : "/images/products/placeholder.svg";
  const stock = Math.max(
    0,
    Math.min(9999, Math.floor(toNumber(p.AvailableQty, 0))),
  );

  const category = await prisma.category.upsert({
    where: { slug: categorySlug },
    create: {
      title: categoryTitle,
      slug: categorySlug,
      image: "/images/categories/placeholder.svg",
    },
    update: { title: categoryTitle, isActive: true },
  });

  const brand = await prisma.brand.upsert({
    where: { slug: brandSlug },
    create: {
      title: brandTitle,
      slug: brandSlug,
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
    name: title,
    slug: existing?.slug ?? productSlug,
    description: description.slice(0, 500),
    longDescription: description
      ? `<p>${description.replace(/</g, "&lt;")}</p>`
      : "",
    metaDescription: description.slice(0, 160),
    sku,
    purchasePrice: Math.round(sellPrice * 0.8 * 100) / 100,
    price: listPrice,
    discount,
    stock,
    requiresPrescription:
      String(p.PrescriptionRequired || "").toLowerCase() === "true",
    categoryId: category.id,
    brandId: brand.id,
    isArchived: false,
    manufacturer: brandTitle,
  };

  let productId: string;
  if (existing) {
    await prisma.product.update({ where: { id: existing.id }, data: payload });
    productId = existing.id;
    await prisma.productImage.deleteMany({ where: { productId } });
  } else {
    const created = await prisma.product.create({ data: payload });
    productId = created.id;
  }

  await prisma.productImage.create({
    data: { productId, url: imageUrl, alt: title, sortOrder: 0 },
  });

  return { title, brand: brandTitle, category: categoryTitle, price: sellPrice };
}

async function* iterateAlphabetProducts(pageSize = 50) {
  const alphabets = [
    ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
    ..."0123456789".split(""),
  ];

  for (const letter of alphabets) {
    let offset = 0;
    let total = Infinity;

    while (offset < total) {
      const url = `${DVAGO_API}/AppAPIV3/GetProductByAlphabetV1&Alphabet=${letter}&limit=${offset},${pageSize}&BranchCode=${BRANCH_CODE}`;
      try {
        const { data } = await axios.get(url, {
          timeout: 30000,
          headers: {
            Accept: "application/json",
            Origin: "https://www.dvago.pk",
            Referer: "https://www.dvago.pk/",
            "User-Agent": "Mozilla/5.0 (compatible; PharmacoImporter/1.0)",
          },
        });
        const rows = (data?.Data || []) as DvagoProduct[];
        total = Number(data?.RecordsCount || rows.length || 0);
        if (!rows.length) break;
        console.log(
          `  [${letter}] offset ${offset}/${total} → ${rows.length}`,
        );
        for (const row of rows) yield row;
        offset += pageSize;
        await sleep(DELAY_MS);
      } catch (err) {
        console.warn(
          `  [${letter}] failed @${offset}:`,
          err instanceof Error ? err.message : err,
        );
        break;
      }
    }
  }
}

async function main() {
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : undefined;

  const progress = loadProgress();
  const done = new Set(progress.processedIds);
  let imported = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`Resume: ${done.size} already done`);
  if (limit) console.log(`Limit: ${limit}`);

  for await (const row of iterateAlphabetProducts(50)) {
    const id = String(row.ProductID || row.Slug || "");
    if (!id) continue;
    if (done.has(id)) {
      skipped += 1;
      continue;
    }
    if (limit && imported >= limit) break;

    try {
      const result = await upsertProduct(row);
      imported += 1;
      done.add(id);
      progress.processedIds.push(id);
      if (imported % 25 === 0) saveProgress(progress);
      console.log(
        `✓ ${imported} ${result.title} | ${result.brand} / ${result.category} | Rs.${result.price}`,
      );
    } catch (err) {
      failed += 1;
      const message = err instanceof Error ? err.message : String(err);
      progress.failed.push({ id, error: message });
      console.warn(`✗ ${id}:`, message);
    }

    await sleep(DELAY_MS);
  }

  saveProgress(progress);
  const counts = {
    products: await prisma.product.count(),
    brands: await prisma.brand.count(),
    categories: await prisma.category.count(),
  };
  console.log("\nDone.", { imported, skipped, failed, counts });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
