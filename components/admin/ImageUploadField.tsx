"use client";

import Image from "next/image";
import { useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

interface ImageUploadFieldProps {
  name?: string;
  existingUrl?: string;
}

const ImageUploadField = ({
  name = "image",
  existingUrl = "/images/products/placeholder.svg",
}: ImageUploadFieldProps) => {
  const [preview, setPreview] = useState(existingUrl);
  const [fileName, setFileName] = useState("");

  return (
    <div className="space-y-2 md:col-span-2">
      <span className="text-sm font-medium text-darkColor">Product image</span>
      <input type="hidden" name="imageUrl" value={existingUrl} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative h-36 w-36 overflow-hidden rounded-xl border border-black/10 bg-shop_light_bg">
          <Image
            src={preview}
            alt="Product preview"
            fill
            unoptimized={preview.startsWith("blob:")}
            className="object-cover"
            sizes="144px"
          />
        </div>

        <div className="flex-1 space-y-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-shop_light_green/50 bg-shop_light_green/5 px-4 py-3 text-sm font-medium text-shop_dark_green transition-colors hover:bg-shop_light_green/10">
            <ImagePlus className="h-4 w-4" />
            Upload image
            <input
              type="file"
              name={name}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setFileName(file.name);
                setPreview(URL.createObjectURL(file));
              }}
            />
          </label>
          {fileName ? (
            <p className="text-xs text-lightColor">Selected: {fileName}</p>
          ) : (
            <p className="text-xs text-lightColor">
              JPG, PNG, WebP or GIF · max 5MB. Leave empty to keep the current
              image.
            </p>
          )}
          {preview !== existingUrl && (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-shop_orange"
              onClick={() => {
                setPreview(existingUrl);
                setFileName("");
                const input = document.querySelector<HTMLInputElement>(
                  `input[type="file"][name="${name}"]`,
                );
                if (input) input.value = "";
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Reset to current image
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUploadField;
