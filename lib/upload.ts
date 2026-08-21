import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_BYTES = 5 * 1024 * 1024;

/** Prefer Blob over File — FormData entries can fail `instanceof File` in Node. */
export function getFormFile(formData: FormData, key: string): File | null {
  const entry = formData.get(key);
  if (typeof entry === "string" || entry == null) return null;
  if (!("size" in entry) || !("arrayBuffer" in entry)) return null;
  if (entry.size <= 0) return null;
  return entry as File;
}

export async function saveUploadedImage(
  file: Blob,
  folder: "products" | "categories" | "brands" | "site" = "products",
): Promise<string> {
  const type = "type" in file ? String(file.type) : "";
  const extension = ALLOWED_TYPES[type];
  if (!extension) {
    throw new Error("Only JPG, PNG, WebP or GIF images are allowed");
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    throw new Error("Image must be under 5MB");
  }

  const relativeDir = path.join("uploads", folder);
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);
  await mkdir(absoluteDir, { recursive: true });

  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(absoluteDir, filename), buffer);

  return `/${relativeDir.replace(/\\/g, "/")}/${filename}`;
}

export async function saveUploadedProductImage(file: File) {
  return saveUploadedImage(file, "products");
}
