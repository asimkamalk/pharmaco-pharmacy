"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import type { PutBlobResult } from "@vercel/blob";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
  /** Kept for compatibility; file is uploaded via /api/blob/upload */
  name?: string;
  existingUrl?: string;
  label?: string;
  /** Hidden field name for the current URL (default: imageUrl) */
  urlFieldName?: string;
  /** Blob folder under uploads/ */
  folder?: "products" | "categories" | "brands" | "site";
  /** Require a new file when there is no usable existing image */
  required?: boolean;
  requiredMessage?: string;
}

const PLACEHOLDER = "/images/products/placeholder.svg";

function isUsableUrl(url: string) {
  return Boolean(url) && !url.includes("placeholder");
}

const ImageUploadField = ({
  existingUrl = "",
  label = "Product image",
  urlFieldName = "imageUrl",
  folder = "products",
  required = false,
  requiredMessage = "Please upload an image",
}: ImageUploadFieldProps) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const usableExisting = isUsableUrl(existingUrl) ? existingUrl : "";
  const [preview, setPreview] = useState(usableExisting || PLACEHOLDER);
  const [uploadedUrl, setUploadedUrl] = useState(usableExisting);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const needsFile = required && !isUsableUrl(uploadedUrl);

  const uploadFile = async (file: File) => {
    setError("");
    setUploading(true);
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));

    try {
      const response = await fetch(
        `/api/blob/upload?filename=${encodeURIComponent(file.name)}&folder=${folder}`,
        {
          method: "POST",
          headers: {
            "content-type": file.type || "application/octet-stream",
          },
          body: file,
        },
      );

      const payload = (await response.json()) as PutBlobResult & {
        error?: string;
      };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Upload failed");
      }

      setUploadedUrl(payload.url);
      setPreview(payload.url);
    } catch (err) {
      setUploadedUrl(usableExisting);
      setPreview(usableExisting || PLACEHOLDER);
      setFileName("");
      setError(err instanceof Error ? err.message : "Upload failed");
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setUploading(false);
    }
  };

  return (
    <div ref={fieldRef} className="space-y-2 md:col-span-2">
      <span className="text-sm font-medium text-darkColor">{label}</span>
      <input type="hidden" name={urlFieldName} value={uploadedUrl} />
      {/* Empty required input so native form validation still works */}
      {needsFile ? (
        <input
          tabIndex={-1}
          className="sr-only"
          required
          value=""
          onChange={() => undefined}
          onInvalid={(event) => {
            event.preventDefault();
            setError(requiredMessage);
            fieldRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }}
        />
      ) : null}

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
            unoptimized={
              preview.startsWith("blob:") || preview.includes("blob.vercel-storage.com")
            }
            className="object-cover"
            sizes="144px"
          />
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="h-6 w-6 animate-spin text-shop_dark_green" />
            </div>
          ) : null}
        </div>

        <div className="flex-1 space-y-3">
          <label
            htmlFor={inputId}
            className={cn(
              "relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-lg border border-dashed px-4 py-3 text-sm font-medium transition-colors",
              uploading && "pointer-events-none opacity-60",
              error
                ? "border-red-400 bg-red-50 text-red-800"
                : "border-shop_light_green/50 bg-shop_light_green/5 text-shop_dark_green hover:bg-shop_light_green/10",
            )}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            {uploading ? "Uploading…" : "Upload image"}
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={uploading}
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                void uploadFile(file);
              }}
            />
          </label>
          {error ? (
            <p role="alert" className="text-sm font-medium text-red-700">
              {error}
            </p>
          ) : fileName ? (
            <p className="text-xs text-lightColor">Uploaded: {fileName}</p>
          ) : (
            <p className="text-xs text-lightColor">
              JPG, PNG, WebP or GIF · max 4.5MB
              {usableExisting
                ? ". Leave empty to keep the current image."
                : required
                  ? ". A background image is required."
                  : "."}
            </p>
          )}
          {uploadedUrl && usableExisting && uploadedUrl !== usableExisting ? (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-shop_orange"
              onClick={() => {
                setPreview(usableExisting);
                setUploadedUrl(usableExisting);
                setFileName("");
                setError("");
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Reset to current image
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ImageUploadField;
