import Link from "next/link";
import { notFound } from "next/navigation";
import AdminFlash from "@/components/admin/AdminFlash";
import ProductForm from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Edit Product · Admin" };

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

const EditProductPage = async ({ params, searchParams }: PageProps) => {
  const { id } = await params;
  const { error } = await searchParams;
  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
    prisma.category.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    prisma.brand.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-darkColor">Edit product</h1>
        <Link
          href="/admin/products"
          className="text-sm font-medium text-shop_light_green hover:text-shop_dark_green"
        >
          ← Back
        </Link>
      </div>
      <AdminFlash error={error} />
      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
        <ProductForm
          categories={categories}
          brands={brands}
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            longDescription: product.longDescription,
            sku: product.sku,
            purchasePrice: product.purchasePrice,
            price: product.price,
            discount: product.discount,
            stock: product.stock,
            categoryId: product.categoryId,
            brandId: product.brandId,
            imageUrl:
              product.images[0]?.url || "/images/products/placeholder.svg",
            requiresPrescription: product.requiresPrescription,
            isFeatured: product.isFeatured,
            isArchived: product.isArchived,
            genericName: product.genericName,
            strength: product.strength,
            dosageForm: product.dosageForm,
            manufacturer: product.manufacturer,
          }}
        />
      </div>
    </div>
  );
};

export default EditProductPage;
