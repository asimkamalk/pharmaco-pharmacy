import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminUser } from "@/lib/admin";

export const runtime = "nodejs";

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const PRESCRIPTION_TYPES = new Set([
  ...IMAGE_TYPES,
  "application/pdf",
]);

const MAX_BYTES = 4.5 * 1024 * 1024;

const FOLDERS = new Set([
  "products",
  "categories",
  "brands",
  "site",
  "prescriptions",
]);

function safeFilename(name: string) {
  return name.replace(/[^\w.\-()+ ]+/g, "_").slice(0, 80) || "upload.bin";
}

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");
  const folder = searchParams.get("folder") || "products";

  if (!filename) {
    return NextResponse.json({ error: "Missing filename" }, { status: 400 });
  }
  if (!FOLDERS.has(folder)) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }
  if (!request.body) {
    return NextResponse.json({ error: "Missing file body" }, { status: 400 });
  }

  const needsAdmin = folder !== "prescriptions";
  if (needsAdmin && !(await isAdminUser(session.user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") || "";
  const allowed =
    folder === "prescriptions" ? PRESCRIPTION_TYPES : IMAGE_TYPES;
  if (!allowed.has(contentType)) {
    return NextResponse.json(
      {
        error:
          folder === "prescriptions"
            ? "Upload a JPG, PNG, WebP, or PDF (max 4.5MB)"
            : "Only JPG, PNG, WebP or GIF images are allowed",
      },
      { status: 400 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BYTES) {
    return NextResponse.json(
      { error: "File must be under 4.5MB" },
      { status: 400 },
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "BLOB_READ_WRITE_TOKEN is not set. Create a Vercel Blob store and reconnect env vars.",
      },
      { status: 500 },
    );
  }

  try {
    const pathname = `uploads/${folder}/${Date.now()}-${safeFilename(filename)}`;
    const blob = await put(pathname, request.body, {
      access: "public",
      contentType,
    });
    return NextResponse.json(blob);
  } catch (error) {
    console.error("Blob upload failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not upload file",
      },
      { status: 500 },
    );
  }
}
