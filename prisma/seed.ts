import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { brandsData, categoriesData, productsData } from "../constants/data";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Pharmaco database...");

  for (const category of categoriesData) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        title: category.title,
        description: category.description,
        image: category.image,
        isActive: true,
      },
      create: {
        title: category.title,
        slug: category.slug,
        description: category.description,
        image: category.image,
      },
    });
  }

  for (const brand of brandsData) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {
        title: brand.title,
        description: brand.description,
        image: brand.image,
        isActive: true,
      },
      create: {
        title: brand.title,
        slug: brand.slug,
        description: brand.description,
        image: brand.image,
      },
    });
  }

  const categories = await prisma.category.findMany();
  const brands = await prisma.brand.findMany();
  const categoryBySlug = Object.fromEntries(
    categories.map((category) => [category.slug, category.id]),
  );
  const brandBySlug = Object.fromEntries(
    brands.map((brand) => [brand.slug, brand.id]),
  );

  for (const product of productsData) {
    const categoryId = categoryBySlug[product.categorySlug];
    const brandId = brandBySlug[product.brandSlug];
    if (!categoryId || !brandId) {
      console.warn(`Skipping ${product.slug}: missing category/brand`);
      continue;
    }

    const purchasePrice = Math.max(
      1,
      Math.round(product.price * 0.65),
    );

    const saved = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        longDescription: `<p>${product.description}</p>`,
        sku: product.sku,
        purchasePrice,
        price: product.price,
        discount: product.discount,
        stock: product.stock,
        requiresPrescription: product.requiresPrescription,
        isFeatured: product.isFeatured,
        rating: product.rating ?? null,
        reviewCount: product.reviewCount ?? 0,
        genericName: product.genericName ?? null,
        strength: product.strength ?? null,
        dosageForm: product.dosageForm ?? null,
        manufacturer: product.manufacturer ?? null,
        categoryId,
        brandId,
        isArchived: false,
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        longDescription: `<p>${product.description}</p>`,
        sku: product.sku,
        purchasePrice,
        price: product.price,
        discount: product.discount,
        stock: product.stock,
        requiresPrescription: product.requiresPrescription,
        isFeatured: product.isFeatured,
        rating: product.rating ?? null,
        reviewCount: product.reviewCount ?? 0,
        genericName: product.genericName ?? null,
        strength: product.strength ?? null,
        dosageForm: product.dosageForm ?? null,
        manufacturer: product.manufacturer ?? null,
        categoryId,
        brandId,
        createdAt: new Date(product.createdAt),
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: saved.id } });
    await prisma.productImage.createMany({
      data: product.images.map((url, index) => ({
        productId: saved.id,
        url,
        sortOrder: index,
      })),
    });
  }

  const adminEmail = (
    process.env.ADMIN_EMAIL || "admin@pharmaco.local"
  ).toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      passwordHash,
      name: "Pharmaco Admin",
      username: "admin",
    },
    create: {
      email: adminEmail,
      name: "Pharmaco Admin",
      username: "admin",
      role: "ADMIN",
      passwordHash,
    },
  });

  console.log("Seed complete.");
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
