/**
 * Enable strip/box selling from title pack info and clean product names.
 *
 *   npx tsx scripts/apply-strip-pack-from-titles.ts
 *   npx tsx scripts/apply-strip-pack-from-titles.ts --dry-run
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import {
  deriveStripPricing,
  parsePackFromTitle,
} from "../lib/pack-from-title";

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

const HAS_PACK_INFO =
  /\(\s*1\s*(?:Box|Strip)\s*=|\b1\s*Box\s*=\s*\d+\s*Strips?|\b1\s*Strip\s*=\s*\d+\s*(?:Tablets?|Capsules?|Tabs?)/i;

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      purchasePrice: true,
      sellByStrip: true,
      unitsPerStrip: true,
      stripsPerBox: true,
      stripPrice: true,
      stripPurchasePrice: true,
      dosageForm: true,
    },
  });

  let updated = 0;
  let stripEnabled = 0;
  let titlesFixed = 0;
  const examples: Array<Record<string, unknown>> = [];
  const pending: Array<{
    id: string;
    data: {
      name: string;
      dosageForm: string | null;
      sellByStrip: boolean;
      unitsPerStrip: number | null;
      stripsPerBox: number | null;
      stripPrice: number | null;
      stripPurchasePrice: number | null;
      price: number;
      purchasePrice: number;
    };
  }> = [];

  for (const product of products) {
    const parsed = parsePackFromTitle(product.name);
    const titleHasPack = HAS_PACK_INFO.test(product.name);

    const next = {
      name: parsed.cleanName,
      dosageForm: parsed.dosageForm ?? product.dosageForm,
      sellByStrip: product.sellByStrip,
      unitsPerStrip: product.unitsPerStrip,
      stripsPerBox: product.stripsPerBox,
      stripPrice: product.stripPrice,
      stripPurchasePrice: product.stripPurchasePrice,
      price: product.price,
      purchasePrice: product.purchasePrice,
    };

    if (titleHasPack && parsed.sellByStrip) {
      const pricing = deriveStripPricing({
        listPrice: product.price,
        purchasePrice: product.purchasePrice,
        stripsPerBox: parsed.stripsPerBox ?? 1,
        priceIsPerStrip: parsed.priceIsPerStrip,
      });
      next.sellByStrip = true;
      next.unitsPerStrip = parsed.unitsPerStrip;
      next.stripsPerBox = parsed.stripsPerBox;
      next.price = pricing.price;
      next.stripPrice = pricing.stripPrice;
      next.purchasePrice = pricing.purchasePrice;
      next.stripPurchasePrice = pricing.stripPurchasePrice;
      stripEnabled += 1;
    }

    if (next.name !== product.name) titlesFixed += 1;

    const changed =
      next.name !== product.name ||
      next.dosageForm !== product.dosageForm ||
      next.sellByStrip !== product.sellByStrip ||
      next.unitsPerStrip !== product.unitsPerStrip ||
      next.stripsPerBox !== product.stripsPerBox ||
      next.stripPrice !== product.stripPrice ||
      next.stripPurchasePrice !== product.stripPurchasePrice ||
      next.price !== product.price ||
      next.purchasePrice !== product.purchasePrice;

    if (!changed) continue;

    if (examples.length < 8) {
      examples.push({
        before: product.name,
        after: next.name,
        sellByStrip: next.sellByStrip,
        stripsPerBox: next.stripsPerBox,
        unitsPerStrip: next.unitsPerStrip,
        price: next.price,
        stripPrice: next.stripPrice,
      });
    }

    pending.push({ id: product.id, data: next });
    updated += 1;
  }

  if (!dryRun) {
    const batchSize = 75;
    for (let i = 0; i < pending.length; i += batchSize) {
      const batch = pending.slice(i, i + batchSize);
      await prisma.$transaction(
        batch.map((item) =>
          prisma.product.update({
            where: { id: item.id },
            data: item.data,
          }),
        ),
      );
      console.log(`Updated ${Math.min(i + batchSize, pending.length)}/${pending.length}`);
    }
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        total: products.length,
        updated,
        stripEnabled,
        titlesFixed,
        examples,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
