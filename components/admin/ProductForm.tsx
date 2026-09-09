"use client";

import { useState } from "react";
import { saveProduct } from "@/lib/actions/admin";
import ImageUploadField from "@/components/admin/ImageUploadField";
import MetaDescriptionField from "@/components/admin/MetaDescriptionField";
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
    metaDescription?: string;
    metaTitle?: string;
    sku: string;
    purchasePrice: number;
    price: number;
    discount: number;
    stock: number;
    categoryId: string;
    brandId: string;
    imageUrl: string;
    requiresPrescription: boolean;
    sellByStrip?: boolean;
    unitsPerStrip?: number | null;
    stripsPerBox?: number | null;
    stripPrice?: number | null;
    stripPurchasePrice?: number | null;
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
  const [sellByStrip, setSellByStrip] = useState(
    Boolean(product?.sellByStrip),
  );

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
            {sellByStrip ? " · per box" : ""}
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
            {sellByStrip ? " · per box" : ""}
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
          <span className="text-sm font-medium text-darkColor">
            Stock{sellByStrip ? " · strips in inventory" : ""}
          </span>
          <input
            name="stock"
            type="number"
            min={0}
            required
            defaultValue={product?.stock ?? 0}
            className={field}
          />
          {sellByStrip && (
            <span className="text-xs text-lightColor">
              Count strips on hand. Selling 1 box deducts “strips per box”.
            </span>
          )}
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
            Plain text, max 500 characters. Shown under the product title on the
            storefront.
          </span>
        </label>

        <MetaDescriptionField
          productName={product?.name}
          defaultTitle={product?.metaTitle || ""}
          defaultValue={product?.metaDescription || ""}
        />

        <RichTextEditor
          name="longDescription"
          label="Long description"
          defaultValue={product?.longDescription || ""}
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
            placeholder="Tablet, Capsule…"
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

      <div className="space-y-3 rounded-xl border border-black/10 bg-shop_light_bg/40 p-4">
        <label className="inline-flex items-center gap-2 text-sm font-medium text-darkColor">
          <input
            type="checkbox"
            name="sellByStrip"
            checked={sellByStrip}
            onChange={(event) => setSellByStrip(event.target.checked)}
          />
          Sell as box + single strip
        </label>
        <p className="text-xs text-lightColor">
          Customers can add a complete box (“Add to cart”) or a single strip.
          Stock is tracked in strips.
        </p>
        {sellByStrip && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-darkColor">
                Tablets / capsules per strip
              </span>
              <input
                name="unitsPerStrip"
                type="number"
                min={1}
                max={500}
                required={sellByStrip}
                defaultValue={product?.unitsPerStrip ?? 10}
                className={field}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-darkColor">
                Strips per box
              </span>
              <input
                name="stripsPerBox"
                type="number"
                min={1}
                max={500}
                required={sellByStrip}
                defaultValue={product?.stripsPerBox ?? 10}
                className={field}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-darkColor">
                Strip selling price (PKR)
              </span>
              <input
                name="stripPrice"
                type="number"
                min={0}
                step="0.01"
                required={sellByStrip}
                defaultValue={product?.stripPrice ?? 0}
                className={field}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-darkColor">
                Strip purchase cost (PKR, optional)
              </span>
              <input
                name="stripPurchasePrice"
                type="number"
                min={0}
                step="0.01"
                defaultValue={product?.stripPurchasePrice ?? ""}
                placeholder="Auto = box cost ÷ strips"
                className={field}
              />
            </label>
          </div>
        )}
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
