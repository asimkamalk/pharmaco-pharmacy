"use client";

import { useState } from "react";

const field =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-shop_light_green";

interface MetaDescriptionFieldProps {
  defaultValue?: string;
  defaultTitle?: string;
  productName?: string;
}

const MetaDescriptionField = ({
  defaultValue = "",
  defaultTitle = "",
  productName = "",
}: MetaDescriptionFieldProps) => {
  const [metaTitle, setMetaTitle] = useState(defaultTitle);
  const [metaDescription, setMetaDescription] = useState(defaultValue);
  const titlePreview = (metaTitle || productName || "Product name").slice(
    0,
    60,
  );
  const descLen = metaDescription.length;
  const descTone =
    descLen === 0
      ? "text-lightColor"
      : descLen < 120
        ? "text-shop_orange"
        : descLen <= 160
          ? "text-shop_dark_green"
          : "text-red-600";

  return (
    <div className="space-y-4 rounded-xl border border-black/10 bg-shop_light_bg/40 p-4 md:col-span-2">
      <div>
        <h3 className="text-sm font-semibold text-darkColor">Product SEO</h3>
        <p className="mt-1 text-xs text-lightColor">
          Controls how this product appears in Google and when shared on social
          media (title, description, and product image).
        </p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-darkColor">
          Meta title{" "}
          <span className="font-normal text-lightColor">(optional)</span>
        </span>
        <input
          name="metaTitle"
          value={metaTitle}
          onChange={(event) => setMetaTitle(event.target.value)}
          maxLength={70}
          placeholder={productName || "Defaults to product name"}
          className={field}
        />
        <span className="text-xs text-lightColor">
          {metaTitle.length}/70 · Leave empty to use the product name
        </span>
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-darkColor">
          Meta description
        </span>
        <textarea
          name="metaDescription"
          rows={3}
          value={metaDescription}
          onChange={(event) => setMetaDescription(event.target.value)}
          maxLength={160}
          placeholder="Write a clear 150–160 character summary for Google search results"
          className={field}
        />
        <span className={`text-xs font-medium ${descTone}`}>
          {descLen}/160 characters
          {descLen === 0
            ? " · Recommended for SEO"
            : descLen < 120
              ? " · A bit short — aim for ~150–160"
              : descLen <= 160
                ? " · Good length for Google"
                : " · Too long"}
        </span>
      </label>

      <div className="rounded-lg border border-black/10 bg-white p-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-lightColor">
          Google preview
        </p>
        <p className="truncate text-base text-[#1a0dab]">
          {titlePreview}
          {titlePreview.length >= 60 ? "…" : ""}
        </p>
        <p className="mt-0.5 truncate text-xs text-[#006621]">
          pharmaco.local/product/…
        </p>
        <p className="mt-1 line-clamp-2 text-sm text-[#4d5156]">
          {metaDescription ||
            "Your meta description will appear here in search results."}
        </p>
      </div>
    </div>
  );
};

export default MetaDescriptionField;
