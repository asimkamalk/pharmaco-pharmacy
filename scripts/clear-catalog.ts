/**
 * One-shot: delete all products, brands, categories via Prisma (uses local .env DATABASE_URL).
 * Prefer the HTTP clear endpoint once ADMIN_SECRET_KEY is on Vercel; this is for immediate wipe.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const images = await prisma.productImage.deleteMany({});
  const products = await prisma.product.deleteMany({});
  const brands = await prisma.brand.deleteMany({});
  const categories = await prisma.category.deleteMany({});
  console.log("Deleted", {
    images: images.count,
    products: products.count,
    brands: brands.count,
    categories: categories.count,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
