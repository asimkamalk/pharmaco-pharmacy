"use client";

import { saveProduct } from "@/lib/actions/admin";
import ImageUploadField from "@/components/admin/ImageUploadField";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface Option {
  id: string;
  title: string;
}

interface ProductFormProps {
  categories: Option[];
  brands: Option[];
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    longDescription?: string;
    sku: string;
    purchasePrice: number;
    price: number;
    discount: number;
    stock: number;
    categoryId: string;
    brandId: string;
    imageUrl: string;
    requiresPrescription: boolean;
    isFeatured: boolean;
    isArchived: boolean;
    genericName?: string | null;
    strength?: string | null;
    dosageForm?: string | null;
    manufacturer?: string | null;
  };
}

const field =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-shop_light_green";

const ProductForm = ({ categories, brands, product }: ProductFormProps) => {
  return (
    <form action={saveProduct} className="space-y-6">
      {product?.id && <input type="hidden" name="id" value={product.id} />}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block space-y-1.5 md:col-span-2">
          <span className="text-sm font-medium text-darkColor">Name</span>
          <input
            name="name"
            required
            defaultValue={product?.name}
            className={field}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-darkColor">Slug</span>
          <input
            name="slug"
            defaultValue={product?.slug}
            placeholder="auto-from-name"
            className={field}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-darkColor">SKU</span>
          <input
            name="sku"
            required
            defaultValue={product?.sku}
            className={field}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-darkColor">
            Purchase price (PKR)
          </span>
          <input
            name="purchasePrice"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={product?.purchasePrice ?? 0}
            className={field}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-darkColor">
            Selling price (PKR)
          </span>
          <input
            name="price"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={product?.price ?? 0}
            className={field}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-darkColor">Discount %</span>
          <input
            name="discount"
            type="number"
            min={0}
            max={100}
            defaultValue={product?.discount ?? 0}
            className={field}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-darkColor">Stock</span>
          <input
            name="stock"
            type="number"
            min={0}
            required
            defaultValue={product?.stock ?? 0}
            className={field}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-darkColor">Category</span>
          <select
            name="categoryId"
            required
            defaultValue={product?.categoryId}
            className={field}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-darkColor">Brand</span>
          <select
            name="brandId"
            required
            defaultValue={product?.brandId}
            className={field}
          >
            <option value="">Select brand</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.title}
              </option>
            ))}
          </select>
        </label>

        <ImageUploadField
          existingUrl={
            product?.imageUrl || "/images/products/placeholder.svg"
          }
        />

        <label className="block space-y-1.5 md:col-span-2">
          <span className="text-sm font-medium text-darkColor">
            Short description
          </span>
          <textarea
            name="description"
            rows={3}
            maxLength={500}
            placeholder="Brief summary shown under the product title"
            defaultValue={product?.description}
            className={field}
          />
          <span className="text-xs text-lightColor">
            Plain text, max 500 characters. Used on the product page summary and
            SEO.
          </span>
        </label>

        <RichTextEditor
          name="longDescription"
          label="Long description"
          defaultValue={product?.longDescription || ""}
          placeholder="Full product details, usage notes, ingredients…"
        />

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-darkColor">
            Generic name
          </span>
          <input
            name="genericName"
            defaultValue={product?.genericName ?? ""}
            className={field}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-darkColor">Strength</span>
          <input
            name="strength"
            defaultValue={product?.strength ?? ""}
            className={field}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-darkColor">
            Dosage form
          </span>
          <input
            name="dosageForm"
            defaultValue={product?.dosageForm ?? ""}
            className={field}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-darkColor">
            Manufacturer
          </span>
          <input
            name="manufacturer"
            defaultValue={product?.manufacturer ?? ""}
            className={field}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="requiresPrescription"
            defaultChecked={product?.requiresPrescription}
          />
          Prescription required
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={product?.isFeatured}
          />
          Featured
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="isArchived"
            defaultChecked={product?.isArchived}
          />
          Archived (hidden from shop)
        </label>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-shop_btn_dark_green px-5 py-2.5 text-sm font-semibold text-white hover:bg-shop_dark_green/90"
      >
        {product ? "Save changes" : "Create product"}
      </button>
    </form>
  );
};

export default ProductForm;
