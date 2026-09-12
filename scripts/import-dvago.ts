/**
 * MVP catalog importer for Pharmaco.
 *
 * DVAGO product pages are client-rendered, so HTML/cheerio scraping returns empty shells.
 * This script uses DVAGO's public AppAPIV3 alphabet listing (same data the website loads),
 * then POSTs each product to our production import API — never talking to the DB directly.
 *
 * Usage:
 *   ADMIN_SECRET_KEY=... npx tsx scripts/import-dvago.ts
 *   ADMIN_SECRET_KEY=... npx tsx scripts/import-dvago.ts --clear --limit=20
 *
 * Env:
 *   ADMIN_SECRET_KEY   required — must match Vercel env
 *   IMPORT_API_BASE    optional — default https://pharmaco-pharmacy.vercel.app
 *   DELAY_MS           optional — pause between API posts (default 400)
 *   BRANCH_CODE        optional — DVAGO branch (default 32)
 */

import fs from "node:fs";
import path from "node:path";
import axios, { type AxiosInstance } from "axios";
import { XMLParser } from "fast-xml-parser";
import { rebrandCatalogText } from "../lib/rebrand-text";

const API_BASE =
  process.env.IMPORT_API_BASE?.replace(/\/$/, "") ||
  "https://pharmaco-pharmacy.vercel.app";
const DVAGO_API = "https://apidb.dvago.pk";
const BRANCH_CODE = process.env.BRANCH_CODE || "32";
const DELAY_MS = Number(process.env.DELAY_MS || 400);
const PROGRESS_FILE = path.join(process.cwd(), "scripts", "progress.json");
const SECRET = process.env.ADMIN_SECRET_KEY || "";

type Progress = {
  processedIds: string[];
  failed: { id: string; error: string }[];
  clearedAt?: string;
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
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseArgs(argv: string[]) {
  const flags = new Set(argv.filter((a) => a.startsWith("--")));
  const limitArg = argv.find((a) => a.startsWith("--limit="));
  return {
    clear: flags.has("--clear"),
    sitemap: flags.has("--sitemap"),
    limit: limitArg ? Number(limitArg.split("=")[1]) : undefined,
  };
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

function toNumber(value: string | undefined, fallback = 0) {
  if (!value) return fallback;
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : fallback;
}

function mapProduct(p: DvagoProduct) {
  const sale = toNumber(p.SalePrice ?? p.Price);
  const discountPrice = toNumber(p.DiscountPrice);
  const price =
    discountPrice > 0 && discountPrice < sale ? discountPrice : sale;
  const originalPrice = sale > price ? sale : undefined;
  const category =
    p.Category?.trim() ||
    p.ChildCategory?.trim() ||
    p.ParentCategory?.trim() ||
    "General";

  return {
    title: (p.Title || "").trim(),
    slug: (p.Slug || "").trim(),
    description: rebrandCatalogText(
      (p.Description || p.MetaDescription || "").trim(),
    ),
    price: Math.round(price * 100) / 100,
    originalPrice: originalPrice
      ? Math.round(originalPrice * 100) / 100
      : undefined,
    brand: (p.Brand || "Unbranded").trim(),
    category,
    imageUrl: "",
    sku: p.ProductID ? `pharmaco-${p.ProductID}` : undefined,
    stock: Math.max(0, Math.min(9999, Math.floor(toNumber(p.AvailableQty, 0)))),
    requiresPrescription: false,
  };
}

async function clearCatalog(http: AxiosInstance) {
  console.log("Clearing production catalog…");
  const res = await http.post(`${API_BASE}/api/admin/clear-catalog`);
  console.log("Cleared:", res.data);
}

async function pushProduct(
  http: AxiosInstance,
  payload: ReturnType<typeof mapProduct>,
) {
  const res = await http.post(
    `${API_BASE}/api/admin/import-product`,
    payload,
  );
  return res.data;
}

/** Paginate DVAGO alphabet listing (A–Z, 0–9). */
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
            "User-Agent":
              "Mozilla/5.0 (compatible; PharmacoImporter/1.0)",
          },
        });

        const rows = (data?.Data || []) as DvagoProduct[];
        total = Number(data?.RecordsCount || rows.length || 0);

        if (!rows.length) break;

        console.log(
          `  [${letter}] offset ${offset}/${total} → ${rows.length} products`,
        );

        for (const row of rows) yield row;

        offset += pageSize;
        await sleep(DELAY_MS);
      } catch (err) {
        console.warn(
          `  [${letter}] page failed at offset ${offset}:`,
          err instanceof Error ? err.message : err,
        );
        break;
      }
    }
  }
}

/** Optional fallback: collect product slugs from DVAGO sitemaps. */
async function fetchSitemapSlugs(): Promise<string[]> {
  const parser = new XMLParser();
  const indexXml = (
    await axios.get("https://www.dvago.pk/sitemap.xml", { timeout: 30000 })
  ).data;
  const index = parser.parse(indexXml);
  const maps = ([] as { loc?: string }[]).concat(
    index?.sitemapindex?.sitemap || [],
  );
  const productMaps = maps
    .map((m) => m.loc)
    .filter((loc): loc is string => Boolean(loc?.includes("product-sitemap")));

  const slugs: string[] = [];
  for (const mapUrl of productMaps) {
    const xml = (await axios.get(mapUrl, { timeout: 60000 })).data;
    const parsed = parser.parse(xml);
    const urls = ([] as { loc?: string }[]).concat(parsed?.urlset?.url || []);
    for (const entry of urls) {
      const loc = entry.loc || "";
      const m = loc.match(/\/p\/([^/?#]+)/);
      if (m?.[1]) slugs.push(m[1]);
    }
    console.log(`Sitemap ${mapUrl} → ${urls.length} urls`);
  }
  return [...new Set(slugs)];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!SECRET) {
    console.error(
      "Missing ADMIN_SECRET_KEY. Set it in your shell or .env before running.",
    );
    process.exit(1);
  }

  const http = axios.create({
    timeout: 60000,
    headers: {
      "Content-Type": "application/json",
      "x-api-secret": SECRET,
    },
    validateStatus: (s) => s >= 200 && s < 500,
  });

  const progress = loadProgress();

  if (args.clear) {
    const res = await http.post(`${API_BASE}/api/admin/clear-catalog`);
    if (res.status >= 400) {
      console.error("Clear failed:", res.status, res.data);
      process.exit(1);
    }
    console.log("Cleared:", res.data);
    progress.processedIds = [];
    progress.failed = [];
    progress.clearedAt = new Date().toISOString();
    saveProgress(progress);
  }

  const done = new Set(progress.processedIds);
  let imported = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`Import API: ${API_BASE}`);
  console.log(`Resume: ${done.size} already processed`);
  if (args.limit) console.log(`Limit: ${args.limit}`);

  // Primary path: alphabet API (has brand, category, price, image).
  for await (const row of iterateAlphabetProducts(50)) {
    const id = String(row.ProductID || row.Slug || "");
    if (!id) continue;
    if (done.has(id)) {
      skipped += 1;
      continue;
    }
    if (args.limit && imported >= args.limit) break;

    const payload = mapProduct(row);
    if (!payload.title || !(payload.price >= 0)) {
      console.warn(`Skip incomplete product ${id}`);
      continue;
    }

    try {
      const result = await pushProduct(http, payload);
      if (result?.ok) {
        imported += 1;
        done.add(id);
        progress.processedIds.push(id);
        if (imported % 10 === 0) saveProgress(progress);
        console.log(
          `✓ ${imported} ${payload.title} (${payload.brand} / ${payload.category}) Rs.${payload.price}`,
        );
      } else {
        failed += 1;
        progress.failed.push({
          id,
          error: JSON.stringify(result),
        });
        console.warn(`✗ ${payload.title}:`, result);
      }
    } catch (err) {
      failed += 1;
      const message = err instanceof Error ? err.message : String(err);
      progress.failed.push({ id, error: message });
      console.warn(`✗ ${payload.title}:`, message);
    }

    await sleep(DELAY_MS);
  }

  // Optional: also walk sitemap slugs (mostly for coverage logging).
  if (args.sitemap) {
    console.log("Fetching sitemap slugs (coverage check)…");
    const slugs = await fetchSitemapSlugs();
    console.log(`Sitemap unique slugs: ${slugs.length}`);
  }

  saveProgress(progress);
  console.log("\nDone.");
  console.log({ imported, skipped, failed, totalTracked: done.size });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
