"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
  name?: string;
  existingUrl?: string;
  label?: string;
  /** Hidden field name for the current URL (default: imageUrl) */
  urlFieldName?: string;
  /** Require a new file when there is no usable existing image */
  required?: boolean;
  requiredMessage?: string;
}

const PLACEHOLDER = "/images/products/placeholder.svg";

function isUsableUrl(url: string) {
  return Boolean(url) && !url.includes("placeholder");
}

const ImageUploadField = ({
  name = "image",
  existingUrl = "",
  label = "Product image",
  urlFieldName = "imageUrl",
  required = false,
  requiredMessage = "Please upload an image",
}: ImageUploadFieldProps) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const usableExisting = isUsableUrl(existingUrl) ? existingUrl : "";
  const [preview, setPreview] = useState(usableExisting || PLACEHOLDER);
  const [fileName, setFileName] = useState("");
  const [hasNewFile, setHasNewFile] = useState(false);
  const [error, setError] = useState("");

  const needsFile = required && !usableExisting && !hasNewFile;

  return (
    <div ref={fieldRef} className="space-y-2 md:col-span-2">
      <span className="text-sm font-medium text-darkColor">{label}</span>
      <input type="hidden" name={urlFieldName} value={usableExisting} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          className={cn(
            "relative h-36 w-36 overflow-hidden rounded-xl border bg-shop_light_bg",
            error ? "border-red-400 ring-2 ring-red-100" : "border-black/10",
          )}
        >
          <Image
            src={preview}
            alt="Upload preview"
            fill
            unoptimized={preview.startsWith("blob:")}
            className="object-cover"
            sizes="144px"
          />
        </div>

        <div className="flex-1 space-y-3">
          <label
            htmlFor={inputId}
            className={cn(
              "relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-lg border border-dashed px-4 py-3 text-sm font-medium transition-colors",
              error
                ? "border-red-400 bg-red-50 text-red-800"
                : "border-shop_light_green/50 bg-shop_light_green/5 text-shop_dark_green hover:bg-shop_light_green/10",
            )}
          >
            <ImagePlus className="h-4 w-4" />
            Upload image
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              name={name}
              accept="image/jpeg,image/png,image/webp,image/gif"
              required={needsFile}
              className="absolute inset-0 cursor-pointer opacity-0"
              onInvalid={(event) => {
                event.preventDefault();
                setError(requiredMessage);
                fieldRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) {
                  setHasNewFile(false);
                  setFileName("");
                  setPreview(usableExisting || PLACEHOLDER);
                  return;
                }
                setError("");
                setHasNewFile(true);
                setFileName(file.name);
                setPreview(URL.createObjectURL(file));
              }}
            />
          </label>
          {error ? (
            <p role="alert" className="text-sm font-medium text-red-700">
              {error}
            </p>
          ) : fileName ? (
            <p className="text-xs text-lightColor">Selected: {fileName}</p>
          ) : (
            <p className="text-xs text-lightColor">
              JPG, PNG, WebP or GIF · max 5MB
              {usableExisting
                ? ". Leave empty to keep the current image."
                : required
                  ? ". A background image is required."
                  : "."}
            </p>
          )}
          {(hasNewFile || preview !== (usableExisting || PLACEHOLDER)) &&
            usableExisting && (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-shop_orange"
                onClick={() => {
                  setPreview(usableExisting);
                  setFileName("");
                  setHasNewFile(false);
                  setError("");
                  if (inputRef.current) inputRef.current.value = "";
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
