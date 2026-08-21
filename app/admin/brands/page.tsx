import Link from "next/link";
import { saveBrand } from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Brands · Admin" };

const field =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-shop_light_green";

const AdminBrandsPage = async () => {
  const brands = await prisma.brand.findMany({
    orderBy: { title: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-darkColor">Brands</h1>
        <p className="text-sm text-lightColor">
          Manage pharmaceutical and wellness brands
        </p>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-darkColor">Add brand</h2>
        <form
          action={saveBrand}
          encType="multipart/form-data"
          className="grid gap-3 md:grid-cols-2"
        >
          <input name="title" required placeholder="Title" className={field} />
          <input name="slug" placeholder="Slug (optional)" className={field} />
          <input
            name="image"
            placeholder="Image URL (or upload)"
            defaultValue="/images/brands/placeholder.svg"
            className={field}
          />
          <label className="space-y-1 text-sm">
            <span>Upload image</span>
            <input
              type="file"
              name="imageFile"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className={field}
            />
          </label>
          <input
            name="description"
            placeholder="Description"
            className={`${field} md:col-span-2`}
          />
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" name="isActive" defaultChecked />
            Active
          </label>
          <button
            type="submit"
            className="rounded-lg bg-shop_btn_dark_green px-4 py-2 text-sm font-semibold text-white md:col-span-2 md:w-fit"
          >
            Create brand
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {brands.map((brand) => (
          <form
            key={brand.id}
            action={saveBrand}
            encType="multipart/form-data"
            className="grid gap-3 rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:grid-cols-2"
          >
            <input type="hidden" name="id" value={brand.id} />
            <input
              name="title"
              required
              defaultValue={brand.title}
              className={field}
            />
            <input name="slug" defaultValue={brand.slug} className={field} />
            <input name="image" defaultValue={brand.image} className={field} />
            <label className="space-y-1 text-sm">
              <span>Replace image</span>
              <input
                type="file"
                name="imageFile"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className={field}
              />
            </label>
            <input
              name="description"
              defaultValue={brand.description}
              className={`${field} md:col-span-2`}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={brand.isActive}
              />
              Active · {brand._count.products} products
            </label>
            <div className="flex items-center justify-end gap-3">
              <Link
                href={`/shop?brand=${brand.slug}`}
                className="text-sm text-shop_light_green hover:text-shop_dark_green"
              >
                View
              </Link>
              <button
                type="submit"
                className="rounded-lg bg-shop_dark_green px-4 py-2 text-sm font-semibold text-white"
              >
                Save
              </button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
};

export default AdminBrandsPage;
