/**
 * Split the single "Medicine" category into useful shop categories
 * based on dosage form + product title heuristics.
 *
 *   npx tsx scripts/reategorize-products.ts
 *   npx tsx scripts/reategorize-products.ts --dry-run
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

type CategoryDef = {
  title: string;
  slug: string;
  description: string;
  image: string;
};

const CATEGORIES: CategoryDef[] = [
  {
    title: "Tablets & Capsules",
    slug: "tablets-capsules",
    description: "Oral solid medicines in tablets, capsules and caplets",
    image: "/images/categories/placeholder.svg",
  },
  {
    title: "Syrups",
    slug: "syrups",
    description: "Liquid syrups for cough, allergy and general care",
    image: "/images/categories/placeholder.svg",
  },
  {
    title: "Suspensions",
    slug: "suspensions",
    description: "Oral suspensions for adults and children",
    image: "/images/categories/placeholder.svg",
  },
  {
    title: "Injections",
    slug: "injections",
    description: "Injectable medicines, ampoules and vials",
    image: "/images/categories/placeholder.svg",
  },
  {
    title: "Drops",
    slug: "drops",
    description: "Eye, ear, nose and oral drops",
    image: "/images/categories/placeholder.svg",
  },
  {
    title: "Skin Care",
    slug: "skin-care",
    description: "Creams, ointments, gels and lotions",
    image: "/images/categories/placeholder.svg",
  },
  {
    title: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    description: "Face wash, soaps, shampoo and everyday personal care",
    image: "/images/categories/placeholder.svg",
  },
  {
    title: "Baby Care",
    slug: "baby-care",
    description: "Gentle products for babies and infants",
    image: "/images/categories/placeholder.svg",
  },
  {
    title: "Vitamins & Supplements",
    slug: "vitamins-supplements",
    description: "Vitamins, minerals and nutritional supplements",
    image: "/images/categories/placeholder.svg",
  },
  {
    title: "Respiratory",
    slug: "respiratory",
    description: "Inhalers, nebuliser solutions and breathing care",
    image: "/images/categories/placeholder.svg",
  },
  {
    title: "Sachets & Powders",
    slug: "sachets-powders",
    description: "Sachets, powders and oral rehydration products",
    image: "/images/categories/placeholder.svg",
  },
  {
    title: "Medicines",
    slug: "medicines",
    description: "General pharmacy medicines and healthcare essentials",
    image: "/images/categories/placeholder.svg",
  },
];

function matches(name: string, pattern: RegExp) {
  return pattern.test(name);
}

function resolveCategorySlug(product: {
  name: string;
  dosageForm: string | null;
}): string {
  const name = product.name;
  const form = (product.dosageForm || "").toLowerCase();

  // Priority: specific use-cases first
  if (
    matches(
      name,
      /\b(baby|infant|diaper|nappy|mothercare|johnson'?s baby|pediasure|cerelac|paed|pediat|children|kids|nufant)\b/i,
    )
  ) {
    return "baby-care";
  }

  if (
    matches(
      name,
      /\b(vitamin|multivitamin|omega[\s-]?3|cod liver|calcium|folic|zinc|supplement|ensura|ensure|glucerna|folate|b-?complex|vitamin\s*d|vitamin\s*c)\b/i,
    ) ||
    matches(name, /\b(vit\.?\s*d|vit\.?\s*c|vit\.?\s*b)\b/i)
  ) {
    return "vitamins-supplements";
  }

  if (
    matches(
      name,
      /\b(face wash|facewash|shampoo|conditioner|soap|serum|moisturizer|moisturiser|sunscreen|toothpaste|mouthwash|deodorant|perfume|makeup|beauty)\b/i,
    )
  ) {
    return "beauty-personal-care";
  }

  if (
    form === "inhaler" ||
    matches(name, /\b(inhaler|nebulis|respirator|ventolin|seretide)\b/i)
  ) {
    return "respiratory";
  }

  if (form === "syrup" || matches(name, /\bsyrup\b/i)) return "syrups";
  if (form === "suspension" || matches(name, /\bsuspension\b/i)) {
    return "suspensions";
  }
  if (
    form === "injection" ||
    matches(name, /\b(injection|ampoule|vial|\binj\b)\b/i)
  ) {
    return "injections";
  }
  if (form === "drops" || matches(name, /\bdrops?\b/i)) return "drops";
  if (form === "sachet" || matches(name, /\b(sachet|powder)\b/i)) {
    return "sachets-powders";
  }

  if (
    ["cream", "ointment", "gel", "lotion"].includes(form) ||
    matches(name, /\b(cream|ointment|gel|lotion)\b/i)
  ) {
    return "skin-care";
  }

  if (
    ["tablet", "capsule", "caplet"].includes(form) ||
    matches(name, /\b(tablet|capsule|caplet|tabs?)\b/i)
  ) {
    return "tablets-capsules";
  }

  return "medicines";
}

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, dosageForm: true, categoryId: true },
  });

  const counts: Record<string, number> = {};
  const assignments = products.map((product) => {
    const slug = resolveCategorySlug(product);
    counts[slug] = (counts[slug] || 0) + 1;
    return { id: product.id, slug };
  });

  console.log(
    JSON.stringify(
      {
        dryRun,
        total: products.length,
        planned: Object.fromEntries(
          Object.entries(counts).sort((a, b) => b[1] - a[1]),
        ),
      },
      null,
      2,
    ),
  );

  if (dryRun) return;

  const categoryIds = new Map<string, string>();
  for (const def of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: def.slug },
      create: {
        title: def.title,
        slug: def.slug,
        description: def.description,
        image: def.image,
        isActive: true,
      },
      update: {
        title: def.title,
        description: def.description,
        isActive: true,
      },
    });
    categoryIds.set(def.slug, row.id);
  }

  // Archive the old single Medicine category if it exists and differs
  const oldMedicine = await prisma.category.findUnique({
    where: { slug: "medicine" },
  });
  if (oldMedicine) {
    await prisma.category.update({
      where: { id: oldMedicine.id },
      data: { isActive: false, title: "Medicine (legacy)" },
    });
  }

  const bySlug = new Map<string, string[]>();
  for (const item of assignments) {
    const list = bySlug.get(item.slug) ?? [];
    list.push(item.id);
    bySlug.set(item.slug, list);
  }

  for (const [slug, ids] of bySlug) {
    const categoryId = categoryIds.get(slug);
    if (!categoryId || ids.length === 0) continue;

    const batchSize = 200;
    for (let i = 0; i < ids.length; i += batchSize) {
      const chunk = ids.slice(i, i + batchSize);
      await prisma.product.updateMany({
        where: { id: { in: chunk } },
        data: { categoryId },
      });
    }
    console.log(`Assigned ${ids.length} → ${slug}`);
  }

  const finalCats = await prisma.category.findMany({
    where: { isActive: true },
    include: { _count: { select: { products: true } } },
    orderBy: { title: "asc" },
  });
  console.log(
    "activeCategories",
    finalCats.map((c) => ({
      title: c.title,
      slug: c.slug,
      count: c._count.products,
    })),
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
