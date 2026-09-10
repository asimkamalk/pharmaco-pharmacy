import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PLACEHOLDER = "/images/products/placeholder.svg";

function isBadImage(url: string) {
  const u = url.toLowerCase();
  return (
    u.includes("dvago-logo") ||
    u.includes("/assets/dvago") ||
    u.includes("noproductfound") ||
    u.includes("no-product") ||
    u.endsWith("/assets/dvago-logo.svg") ||
    u.includes("www.dvago.pk/assets/")
  );
}

async function main() {
  const images = await prisma.productImage.findMany({
    select: { id: true, url: true },
  });

  const bad = images.filter((img) => isBadImage(img.url));
  console.log(`Scanning ${images.length} images, bad=${bad.length}`);

  if (bad.length === 0) {
    // Also catch any exact logo URL variants seen in the wild
    const sample = [...new Set(images.map((i) => i.url))]
      .filter((u) => u.includes("dvago"))
      .slice(0, 20);
    console.log("dvago urls sample:", sample);
    return;
  }

  const result = await prisma.productImage.updateMany({
    where: { id: { in: bad.map((b) => b.id) } },
    data: { url: PLACEHOLDER },
  });

  console.log(`Updated ${result.count} product images → ${PLACEHOLDER}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
