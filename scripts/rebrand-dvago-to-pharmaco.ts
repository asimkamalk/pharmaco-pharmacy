/**
 * Rewrite imported DVAGO branding in the catalog to Pharmaco (fast SQL).
 *
 *   npx tsx scripts/rebrand-dvago-to-pharmaco.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Case-aware Dvago → Pharmaco replacements for Postgres text. */
function rebrandSql(column: string) {
  return `REPLACE(REPLACE(REPLACE(${column}, 'DVAGO', 'PHARMACO'), 'Dvago', 'Pharmaco'), 'dvago', 'pharmaco')`;
}

async function main() {
  const products = await prisma.$executeRawUnsafe(`
    UPDATE "Product"
    SET
      "name" = ${rebrandSql('"name"')},
      "description" = ${rebrandSql('"description"')},
      "longDescription" = ${rebrandSql('"longDescription"')},
      "metaDescription" = ${rebrandSql('"metaDescription"')},
      "metaTitle" = CASE
        WHEN "metaTitle" IS NULL THEN NULL
        ELSE ${rebrandSql('"metaTitle"')}
      END,
      "sku" = REGEXP_REPLACE("sku", '^dvago-', 'pharmaco-', 'i')
    WHERE
      "sku" ILIKE 'dvago-%'
      OR "name" ILIKE '%dvago%'
      OR "description" ILIKE '%dvago%'
      OR "longDescription" ILIKE '%dvago%'
      OR "metaDescription" ILIKE '%dvago%'
      OR COALESCE("metaTitle", '') ILIKE '%dvago%'
  `);

  const orderItems = await prisma.$executeRawUnsafe(`
    UPDATE "OrderItem"
    SET "sku" = REGEXP_REPLACE("sku", '^dvago-', 'pharmaco-', 'i')
    WHERE "sku" ILIKE 'dvago-%'
  `);

  const brands = await prisma.$executeRawUnsafe(`
    UPDATE "Brand"
    SET
      "title" = ${rebrandSql('"title"')},
      "description" = ${rebrandSql('"description"')}
    WHERE
      "title" ILIKE '%dvago%'
      OR "description" ILIKE '%dvago%'
  `);

  const categories = await prisma.$executeRawUnsafe(`
    UPDATE "Category"
    SET
      "title" = ${rebrandSql('"title"')},
      "description" = ${rebrandSql('"description"')}
    WHERE
      "title" ILIKE '%dvago%'
      OR "description" ILIKE '%dvago%'
  `);

  const remaining = await prisma.product.count({
    where: {
      OR: [
        { sku: { contains: "dvago", mode: "insensitive" } },
        { description: { contains: "dvago", mode: "insensitive" } },
        { longDescription: { contains: "dvago", mode: "insensitive" } },
        { metaDescription: { contains: "dvago", mode: "insensitive" } },
      ],
    },
  });

  const sample = await prisma.product.findFirst({
    where: { sku: { startsWith: "pharmaco-" } },
    select: { sku: true, description: true },
  });

  console.log(
    JSON.stringify(
      {
        productsUpdated: products,
        orderItemsUpdated: orderItems,
        brandsUpdated: brands,
        categoriesUpdated: categories,
        remainingWithDvago: remaining,
        sample,
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
