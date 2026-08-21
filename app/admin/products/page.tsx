import Link from "next/link";
import AdminFlash from "@/components/admin/AdminFlash";
import { prisma } from "@/lib/prisma";
import { formatPrice, getDiscountedPrice } from "@/lib/utils";
import { mapProduct } from "@/lib/mappers";

export const metadata = { title: "Products · Admin" };

interface PageProps {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

const AdminProductsPage = async ({ searchParams }: PageProps) => {
  const { saved, error } = await searchParams;
  const rows = await prisma.product.findMany({
    include: {
      category: { select: { slug: true, title: true } },
      brand: { select: { slug: true, title: true } },
      images: { select: { url: true, sortOrder: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  const products = rows.map((row) => mapProduct(row, { includeCost: true }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-darkColor">Products</h1>
          <p className="text-sm text-lightColor">
            Manage stock, selling price and purchase cost
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-shop_btn_dark_green px-4 py-2 text-sm font-semibold text-white hover:bg-shop_dark_green/90"
        >
          Add product
        </Link>
      </div>

      <AdminFlash saved={saved} error={error} savedMessage="Product saved." />

      <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-black/10 bg-shop_light_bg/80 text-xs uppercase tracking-wide text-lightColor">
            <tr>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Cost</th>
              <th className="px-4 py-3 font-semibold">Sell</th>
              <th className="px-4 py-3 font-semibold">Margin</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {products.map((product) => {
              const sell = getDiscountedPrice(product.price, product.discount);
              const cost = product.purchasePrice ?? 0;
              const margin = sell - cost;
              return (
                <tr key={product.id} className="hover:bg-shop_light_bg/40">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-darkColor">
                      {product.name}
                    </p>
                    <p className="text-xs text-lightColor">
                      {product.sku} · {product.categoryTitle} ·{" "}
                      {product.brandTitle}
                    </p>
                  </td>
                  <td className="px-4 py-3">{formatPrice(cost)}</td>
                  <td className="px-4 py-3">
                    {formatPrice(sell)}
                    {product.discount > 0 && (
                      <span className="ml-1 text-xs text-shop_orange">
                        -{product.discount}%
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-shop_dark_green">
                    {formatPrice(margin)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        product.stock <= 10
                          ? "font-semibold text-shop_orange"
                          : ""
                      }
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs capitalize">
                    {product.isArchived ? "Archived" : "Live"}
                    {product.isFeatured ? " · Featured" : ""}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-medium text-shop_light_green hover:text-shop_dark_green"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductsPage;
