import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const PRESCRIPTION_TYPES: Record<string, string> = {
  ...ALLOWED_TYPES,
  "application/pdf": "pdf",
};

const MAX_BYTES = 4.5 * 1024 * 1024;

/** Prefer Blob over File — FormData entries can fail `instanceof File` in Node. */
export function getFormFile(formData: FormData, key: string): File | null {
  const entry = formData.get(key);
  if (typeof entry === "string" || entry == null) return null;
  if (!("size" in entry) || !("arrayBuffer" in entry)) return null;
  if (entry.size <= 0) return null;
  return entry as File;
}

function useVercelBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function isVercelRuntime() {
  return process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);
}

async function saveToBlob(
  file: Blob,
  pathname: string,
  contentType: string,
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await put(pathname, buffer, {
    access: "public",
    contentType,
  });
  return result.url;
}

async function saveToLocalDisk(
  file: Blob,
  relativeDir: string,
  filename: string,
): Promise<string> {
  if (isVercelRuntime()) {
    throw new Error(
      "File uploads on Vercel require BLOB_READ_WRITE_TOKEN. Add a Blob store in the Vercel project and set that env var.",
    );
  }

  const absoluteDir = path.join(process.cwd(), "public", relativeDir);
  await mkdir(absoluteDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(absoluteDir, filename), buffer);
  return `/${relativeDir.replace(/\\/g, "/")}/${filename}`;
}

async function persistUpload(
  file: Blob,
  relativeDir: string,
  filename: string,
  contentType: string,
): Promise<string> {
  const pathname = `${relativeDir.replace(/\\/g, "/")}/${filename}`;
  if (useVercelBlob()) {
    return saveToBlob(file, pathname, contentType);
  }
  return saveToLocalDisk(file, relativeDir, filename);
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
    throw new Error("Image must be under 4.5MB");
  }

  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${extension}`;
  const relativeDir = path.join("uploads", folder);
  return persistUpload(file, relativeDir, filename, type);
}

export async function saveUploadedProductImage(file: File) {
  return saveUploadedImage(file, "products");
}

export type PrescriptionUploadResult = {
  url: string;
  fileName: string;
  mimeType: string;
};

export async function saveUploadedPrescription(
  file: Blob,
): Promise<PrescriptionUploadResult> {
  const type = "type" in file ? String(file.type) : "";
  const extension = PRESCRIPTION_TYPES[type];
  if (!extension) {
    throw new Error("Upload a JPG, PNG, WebP, or PDF prescription (max 5MB)");
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    throw new Error("Prescription file must be under 4.5MB");
  }

  const originalName =
    "name" in file && typeof file.name === "string" && file.name
      ? file.name.replace(/[^\w.\-()+ ]+/g, "_").slice(0, 80)
      : `prescription.${extension}`;
  const filename = `${Date.now()}-${randomUUID().slice(0, 10)}.${extension}`;
  const relativeDir = path.join("uploads", "prescriptions");
  const url = await persistUpload(file, relativeDir, filename, type);

  return {
    url,
    fileName: originalName,
    mimeType: type,
  };
}
