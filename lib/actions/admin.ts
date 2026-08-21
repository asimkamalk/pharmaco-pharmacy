"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { firstZodMessage, redirectWithFlash } from "@/lib/admin-flash";
import { prisma } from "@/lib/prisma";
import { sanitizeProductHtml } from "@/lib/sanitize";
import {
  getFormFile,
  saveUploadedImage,
  saveUploadedProductImage,
} from "@/lib/upload";
import type { OrderStatus } from "@/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const productSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(200),
  slug: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().max(500).optional(),
  longDescription: z.string().max(100_000).optional(),
  metaDescription: z.string().trim().max(160).optional(),
  metaTitle: z.string().trim().max(70).optional(),
  sku: z.string().trim().min(2, "SKU is required").max(60),
  purchasePrice: z.coerce.number().min(0, "Purchase price is required"),
  price: z.coerce.number().min(0, "Price is required"),
  discount: z.coerce.number().int().min(0).max(100),
  stock: z.coerce.number().int().min(0, "Stock is required"),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().min(1, "Brand is required"),
  imageUrl: z.string().trim().min(1, "Product image is required"),
  requiresPrescription: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  isArchived: z.coerce.boolean().optional(),
  genericName: z.string().trim().optional(),
  strength: z.string().trim().optional(),
  dosageForm: z.string().trim().optional(),
  manufacturer: z.string().trim().optional(),
});

function formBool(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function productFormPath(id: string) {
  return id ? `/admin/products/${id}` : "/admin/products/new";
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const back = productFormPath(id);

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || "",
    longDescription: formData.get("longDescription") || "",
    metaDescription: formData.get("metaDescription") || "",
    metaTitle: formData.get("metaTitle") || "",
    sku: formData.get("sku"),
    purchasePrice: formData.get("purchasePrice"),
    price: formData.get("price"),
    discount: formData.get("discount") || 0,
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
    brandId: formData.get("brandId"),
    imageUrl: formData.get("imageUrl") || "/images/products/placeholder.svg",
    requiresPrescription: formBool(formData, "requiresPrescription"),
    isFeatured: formBool(formData, "isFeatured"),
    isArchived: formBool(formData, "isArchived"),
    genericName: String(formData.get("genericName") ?? "") || undefined,
    strength: String(formData.get("strength") ?? "") || undefined,
    dosageForm: String(formData.get("dosageForm") ?? "") || undefined,
    manufacturer: String(formData.get("manufacturer") ?? "") || undefined,
  });

  if (!parsed.success) {
    redirectWithFlash(back, { error: firstZodMessage(parsed.error.issues) });
  }

  const data = parsed.data;
  const slug = data.slug?.trim() || slugify(data.name);

  let imageUrl = data.imageUrl;
  try {
    const imageFile = getFormFile(formData, "image");
    if (imageFile) {
      imageUrl = await saveUploadedProductImage(imageFile);
    }
  } catch (err) {
    redirectWithFlash(back, {
      error:
        err instanceof Error ? err.message : "Could not upload the product image",
    });
  }

  if (!imageUrl || imageUrl.includes("placeholder")) {
    redirectWithFlash(back, {
      error: "Please upload a product image",
    });
  }

  const payload = {
    name: data.name,
    slug,
    description: data.description || "",
    longDescription: sanitizeProductHtml(data.longDescription || ""),
    metaDescription: data.metaDescription || "",
    metaTitle: data.metaTitle || "",
    sku: data.sku,
    purchasePrice: data.purchasePrice,
    price: data.price,
    discount: data.discount,
    stock: data.stock,
    categoryId: data.categoryId,
    brandId: data.brandId,
    requiresPrescription: Boolean(data.requiresPrescription),
    isFeatured: Boolean(data.isFeatured),
    isArchived: Boolean(data.isArchived),
    genericName: data.genericName || null,
    strength: data.strength || null,
    dosageForm: data.dosageForm || null,
    manufacturer: data.manufacturer || null,
  };

  try {
    if (id) {
      await prisma.product.update({
        where: { id },
        data: payload,
      });
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.create({
        data: { productId: id, url: imageUrl, sortOrder: 0 },
      });
    } else {
      const created = await prisma.product.create({ data: payload });
      await prisma.productImage.create({
        data: { productId: created.id, url: imageUrl, sortOrder: 0 },
      });
    }
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes("Unique constraint")
        ? "A product with this SKU or slug already exists"
        : "Could not save the product. Check required fields and try again.";
    redirectWithFlash(back, { error: message });
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath(`/product/${slug}`);
  redirectWithFlash("/admin/products", { saved: true });
}

export async function archiveProduct(id: string) {
  await requireAdmin();
  await prisma.product.update({
    where: { id },
    data: { isArchived: true },
  });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim() || slugify(title);
  const description = String(formData.get("description") ?? "").trim();
  let image =
    String(formData.get("image") ?? "").trim() ||
    String(formData.get("imageUrl") ?? "").trim() ||
    "/images/categories/placeholder.svg";

  try {
    const imageFile = getFormFile(formData, "imageFile");
    if (imageFile) {
      image = await saveUploadedImage(imageFile, "categories");
    }
  } catch (err) {
    redirectWithFlash("/admin/categories", {
      error:
        err instanceof Error
          ? err.message
          : "Could not upload the category image",
    });
  }

  const isActive = formBool(formData, "isActive");

  if (title.length < 2) {
    redirectWithFlash("/admin/categories", {
      error: "Category title is required",
    });
  }

  try {
    if (id) {
      await prisma.category.update({
        where: { id },
        data: { title, slug, description, image, isActive },
      });
    } else {
      await prisma.category.create({
        data: { title, slug, description, image, isActive },
      });
    }
  } catch {
    redirectWithFlash("/admin/categories", {
      error: "Could not save category. Title/slug may already exist.",
    });
  }

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath("/");
  redirectWithFlash("/admin/categories", { saved: true });
}

export async function saveBrand(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim() || slugify(title);
  const description = String(formData.get("description") ?? "").trim();
  let image =
    String(formData.get("image") ?? "").trim() ||
    String(formData.get("imageUrl") ?? "").trim() ||
    "/images/brands/placeholder.svg";

  try {
    const imageFile = getFormFile(formData, "imageFile");
    if (imageFile) {
      image = await saveUploadedImage(imageFile, "brands");
    }
  } catch (err) {
    redirectWithFlash("/admin/brands", {
      error:
        err instanceof Error ? err.message : "Could not upload the brand image",
    });
  }

  const isActive = formBool(formData, "isActive");

  if (title.length < 2) {
    redirectWithFlash("/admin/brands", { error: "Brand title is required" });
  }

  try {
    if (id) {
      await prisma.brand.update({
        where: { id },
        data: { title, slug, description, image, isActive },
      });
    } else {
      await prisma.brand.create({
        data: { title, slug, description, image, isActive },
      });
    }
  } catch {
    redirectWithFlash("/admin/brands", {
      error: "Could not save brand. Title/slug may already exist.",
    });
  }

  revalidatePath("/admin/brands");
  revalidatePath("/");
  redirectWithFlash("/admin/brands", { saved: true });
}

export async function setOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdmin();
  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
