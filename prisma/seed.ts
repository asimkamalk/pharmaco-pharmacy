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

  const { defaultSiteConfig } = await import("../constants/site");
  const d = defaultSiteConfig;

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: d.name,
      shortName: d.shortName,
      tagline: d.tagline,
      description: d.description,
      area: d.location.area,
      city: d.location.city,
      country: d.location.country,
      address: d.location.address,
      phone: d.contact.phone,
      whatsapp: d.contact.whatsapp,
      email: d.contact.email,
      openingHours: d.contact.openingHours,
      deliveryStandardFee: d.delivery.standardFee,
      freeDeliveryAbove: d.delivery.freeDeliveryAbove,
      deliveryEstimate: d.delivery.estimate,
      bankName: d.payments.bankTransfer.bankName,
      bankAccountTitle: d.payments.bankTransfer.accountTitle,
      bankAccountNumber: d.payments.bankTransfer.accountNumber,
      bankIban: d.payments.bankTransfer.iban,
      easyPaisaTitle: d.payments.easyPaisa.accountTitle,
      easyPaisaNumber: d.payments.easyPaisa.mobileNumber,
      jazzCashTitle: d.payments.jazzCash.accountTitle,
      jazzCashNumber: d.payments.jazzCash.mobileNumber,
      mapEmbedUrl: d.map.embedUrl,
      mapLinkUrl: d.map.linkUrl,
      logoUrl: d.branding.logoUrl,
      facebookUrl: d.social.facebook,
      instagramUrl: d.social.instagram,
      tiktokUrl: d.social.tiktok,
      twitterUrl: d.social.twitter,
      seoTitle: d.seo.title,
      seoDescription: d.seo.description,
      heroEyebrow: d.home.heroEyebrow,
      heroHeadline: d.home.heroHeadline,
      heroSubcopy: d.home.heroSubcopy,
      heroCtaPrimaryLabel: d.home.heroCtaPrimaryLabel,
      heroCtaPrimaryHref: d.home.heroCtaPrimaryHref,
      heroCtaSecondaryLabel: d.home.heroCtaSecondaryLabel,
      heroCtaSecondaryHref: d.home.heroCtaSecondaryHref,
      heroBackgroundUrl: d.home.heroBackgroundUrl,
      heroImageUrl: d.home.heroImageUrl,
      promoHeadline: d.home.promoHeadline,
      promoSubcopy: d.home.promoSubcopy,
      whyChooseJson: JSON.stringify(d.home.whyChoose),
    },
  });

  const cmsPages = [
    {
      slug: "about",
      title: `About ${d.name}`,
      bodyHtml: `<p>${d.name} is a community pharmacy based in ${d.location.area}, ${d.location.city}. We provide genuine medicines, healthcare products and wellness essentials with pharmacist support.</p><h2>How we work</h2><p>Orders are reviewed by licensed pharmacists. Prescription medicines require a valid prescription at checkout.</p>`,
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      bodyHtml: `<p>This privacy policy explains how ${d.name} collects and uses personal information when you shop with us online or in store.</p><p>Replace this content with your final legal privacy policy before going live.</p>`,
    },
    {
      slug: "terms",
      title: "Terms & Conditions",
      bodyHtml: `<p>These terms govern your use of the ${d.name} website and online ordering services.</p><p>Replace this content with your final terms and conditions before going live.</p>`,
    },
  ];

  for (const page of cmsPages) {
    await prisma.cmsPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }

  const slideCount = await prisma.heroSlide.count();
  if (slideCount === 0) {
    await prisma.heroSlide.create({
      data: {
        sortOrder: 0,
        eyebrow: `${d.name} — ${d.location.area}, ${d.location.city}`,
        headline: d.home.heroHeadline,
        subcopy: d.home.heroSubcopy,
        ctaLabel: d.home.heroCtaPrimaryLabel,
        ctaHref: d.home.heroCtaPrimaryHref,
        ctaSecondaryLabel: d.home.heroCtaSecondaryLabel,
        ctaSecondaryHref: d.home.heroCtaSecondaryHref,
        backgroundUrl: "/images/pharmaco-logo.png",
        isActive: true,
      },
    });
  }

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
