/**
 * Clear requiresPrescription on all products (admin can re-enable per product).
 *
 *   npx tsx scripts/clear-prescription-required.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const before = await prisma.product.count({
    where: { requiresPrescription: true },
  });

  const result = await prisma.product.updateMany({
    where: { requiresPrescription: true },
    data: { requiresPrescription: false },
  });

  console.log(
    JSON.stringify(
      {
        previouslyRequired: before,
        cleared: result.count,
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
