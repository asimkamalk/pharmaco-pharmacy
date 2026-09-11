import Link from "next/link";
import { Search } from "lucide-react";
import type { Prisma } from "@prisma/client";
import AdminFlash from "@/components/admin/AdminFlash";
import { prisma } from "@/lib/prisma";
import { formatPrice, getDiscountedPrice, cn } from "@/lib/utils";
import { mapProduct } from "@/lib/mappers";

export const metadata = { title: "Products · Admin" };

const PAGE_SIZE = 40;

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    brand?: string;
    status?: string;
    stock?: string;
    pack?: string;
    rx?: string;
    featured?: string;
    page?: string;
    saved?: string;
    error?: string;
  }>;
}

function buildHref(
  base: Record<string, string | undefined>,
  overrides: Record<string, string | undefined> = {},
) {
  const params = new URLSearchParams();
  const merged = { ...base, ...overrides };
  for (const [key, value] of Object.entries(merged)) {
    if (!value || value === "all") continue;
    if (key === "page" && value === "1") continue;
    params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/admin/products?${qs}` : "/admin/products";
}

const AdminProductsPage = async ({ searchParams }: PageProps) => {
  const sp = await searchParams;
  const {
    saved,
    error,
    q,
    category: categorySlug,
    brand: brandSlug,
    status = "live",
    stock = "all",
    pack = "all",
    rx = "all",
    featured = "all",
    page: pageRaw,
  } = sp;

  const query = q?.trim() ?? "";
  const page = Math.max(1, Number(pageRaw) || 1);

  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { title: "asc" },
      select: { slug: true, title: true },
    }),
    prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { title: "asc" },
      select: { slug: true, title: true },
    }),
  ]);

  const and: Prisma.ProductWhereInput[] = [];

  if (query) {
    and.push({
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { sku: { contains: query, mode: "insensitive" } },
        { manufacturer: { contains: query, mode: "insensitive" } },
        { brand: { title: { contains: query, mode: "insensitive" } } },
        { category: { title: { contains: query, mode: "insensitive" } } },
      ],
    });
  }

  if (categorySlug && categorySlug !== "all") {
    and.push({ category: { slug: categorySlug } });
  }
  if (brandSlug && brandSlug !== "all") {
    and.push({ brand: { slug: brandSlug } });
  }

  if (status === "live") and.push({ isArchived: false });
  else if (status === "archived") and.push({ isArchived: true });

  if (stock === "out") and.push({ stock: { lte: 0 } });
  else if (stock === "low") and.push({ stock: { gt: 0, lte: 10 } });

  if (pack === "strip") and.push({ sellByStrip: true });
  else if (pack === "unit") and.push({ sellByStrip: false });

  if (rx === "yes") and.push({ requiresPrescription: true });
  else if (rx === "no") and.push({ requiresPrescription: false });

  if (featured === "yes") and.push({ isFeatured: true });
  else if (featured === "no") and.push({ isFeatured: false });

  const where: Prisma.ProductWhereInput =
    and.length > 0 ? { AND: and } : {};


  const total = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const rows = await prisma.product.findMany({
    where,
    include: {
      category: { select: { slug: true, title: true } },
      brand: { select: { slug: true, title: true } },
      images: { select: { url: true, sortOrder: true } },
    },
    orderBy: { updatedAt: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
  const products = rows.map((row) => mapProduct(row, { includeCost: true }));

  const filterState = {
    q: query || undefined,
    category: categorySlug,
    brand: brandSlug,
    status,
    stock,
    pack,
    rx,
    featured,
  };

  const hasFilters =
    Boolean(query) ||
    (categorySlug && categorySlug !== "all") ||
    (brandSlug && brandSlug !== "all") ||
    status !== "live" ||
    stock !== "all" ||
    pack !== "all" ||
    rx !== "all" ||
    featured !== "all";

  const selectClass =
    "rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-shop_light_green";

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

      <form
        action="/admin/products"
        method="get"
        className="space-y-3 rounded-2xl border border-black/10 bg-white p-4 shadow-sm"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative block min-w-0 flex-1">
            <span className="sr-only">Search products</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lightColor" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search by name, SKU, brand, or category…"
              className="w-full rounded-xl border border-black/15 bg-white py-2.5 pl-10 pr-3.5 text-sm outline-none focus:border-shop_light_green"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-xl bg-shop_btn_dark_green px-4 py-2.5 text-sm font-semibold text-white hover:bg-shop_dark_green/90"
            >
              Search
            </button>
            {hasFilters ? (
              <Link
                href="/admin/products"
                className="rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm font-semibold text-darkColor hover:bg-shop_light_bg"
              >
                Clear
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
          <label className="space-y-1">
            <span className="text-xs font-medium text-lightColor">Category</span>
            <select
              name="category"
              defaultValue={categorySlug || "all"}
              className={cn(selectClass, "w-full")}
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-lightColor">Brand</span>
            <select
              name="brand"
              defaultValue={brandSlug || "all"}
              className={cn(selectClass, "w-full")}
            >
              <option value="all">All brands</option>
              {brands.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.title}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-lightColor">Status</span>
            <select
              name="status"
              defaultValue={status}
              className={cn(selectClass, "w-full")}
            >
              <option value="live">Live</option>
              <option value="archived">Archived</option>
              <option value="all">All</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-lightColor">Stock</span>
            <select
              name="stock"
              defaultValue={stock}
              className={cn(selectClass, "w-full")}
            >
              <option value="all">All stock</option>
              <option value="low">Low (≤ 10)</option>
              <option value="out">Out of stock</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-lightColor">Pack</span>
            <select
              name="pack"
              defaultValue={pack}
              className={cn(selectClass, "w-full")}
            >
              <option value="all">All packs</option>
              <option value="strip">Box / strip</option>
              <option value="unit">Single piece</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-lightColor">More</span>
            <div className="flex gap-2">
              <select
                name="rx"
                defaultValue={rx}
                className={cn(selectClass, "min-w-0 flex-1")}
                aria-label="Prescription"
              >
                <option value="all">Rx: all</option>
                <option value="yes">Rx required</option>
                <option value="no">No Rx</option>
              </select>
              <select
                name="featured"
                defaultValue={featured}
                className={cn(selectClass, "min-w-0 flex-1")}
                aria-label="Featured"
              >
                <option value="all">Featured: all</option>
                <option value="yes">Featured</option>
                <option value="no">Not featured</option>
              </select>
            </div>
          </label>
        </div>
      </form>

      <p className="text-sm text-lightColor">
        {total === 0
          ? hasFilters
            ? "No products match these filters."
            : "No products yet."
          : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, total)} of ${total} product${total === 1 ? "" : "s"}.`}
      </p>

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
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-lightColor"
                >
                  {hasFilters
                    ? "No products match these filters."
                    : "No products yet."}
                </td>
              </tr>
            ) : (
              products.map((product) => {
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
                        {product.sellByStrip ? " strips" : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs capitalize">
                      {product.isArchived ? "Archived" : "Live"}
                      {product.isFeatured ? " · Featured" : ""}
                      {product.requiresPrescription ? " · Rx" : ""}
                      {product.sellByStrip ? " · Box + strip" : ""}
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
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-lightColor">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 ? (
              <Link
                href={buildHref(filterState, {
                  page: String(currentPage - 1),
                })}
                className="rounded-xl border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-darkColor hover:bg-shop_light_bg"
              >
                Previous
              </Link>
            ) : null}
            {currentPage < totalPages ? (
              <Link
                href={buildHref(filterState, {
                  page: String(currentPage + 1),
                })}
                className="rounded-xl border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-darkColor hover:bg-shop_light_bg"
              >
                Next
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminProductsPage;
