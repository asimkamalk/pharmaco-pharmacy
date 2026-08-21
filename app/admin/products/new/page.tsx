import Link from "next/link";
import AdminFlash from "@/components/admin/AdminFlash";
import ProductForm from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Add Product · Admin" };

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

const NewProductPage = async ({ searchParams }: PageProps) => {
  const { error } = await searchParams;
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-darkColor">Add product</h1>
        <Link
          href="/admin/products"
          className="text-sm font-medium text-shop_light_green hover:text-shop_dark_green"
        >
          ← Back
        </Link>
      </div>
      <AdminFlash error={error} />
      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
        <ProductForm categories={categories} brands={brands} />
      </div>
    </div>
  );
};

export default NewProductPage;
