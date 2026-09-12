/**
 * Replace watermarked DVAGO CDN product photos with the local placeholder.
 *
 *   npx tsx scripts/replace-dvago-images.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PLACEHOLDER = "/images/products/placeholder.svg";

async function main() {
  const result = await prisma.productImage.updateMany({
    where: {
      OR: [
        { url: { contains: "dvago", mode: "insensitive" } },
        { url: { contains: "dvago-assets", mode: "insensitive" } },
      ],
    },
    data: { url: PLACEHOLDER },
  });

  const remaining = await prisma.productImage.count({
    where: { url: { contains: "dvago", mode: "insensitive" } },
  });

  console.log(
    JSON.stringify(
      {
        replaced: result.count,
        remainingDvago: remaining,
        placeholder: PLACEHOLDER,
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
