"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { sanitizeProductHtml } from "@/lib/sanitize";
import { saveUploadedProductImage } from "@/lib/upload";
import type { OrderStatus } from "@/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const productSchema = z.object({
  name: z.string().trim().min(2).max(200),
  slug: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().max(500).optional(),
  longDescription: z.string().max(100_000).optional(),
  sku: z.string().trim().min(2).max(60),
  purchasePrice: z.coerce.number().min(0),
  price: z.coerce.number().min(0),
  discount: z.coerce.number().int().min(0).max(100),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string().min(1),
  brandId: z.string().min(1),
  imageUrl: z.string().trim().min(1),
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

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || "",
    longDescription: formData.get("longDescription") || "",
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
    throw new Error(parsed.error.issues[0]?.message || "Invalid product data");
  }

  const data = parsed.data;
  const slug = data.slug?.trim() || slugify(data.name);

  let imageUrl = data.imageUrl;
  const imageFile = formData.get("image");
  if (imageFile instanceof File && imageFile.size > 0) {
    imageUrl = await saveUploadedProductImage(imageFile);
  }

  const payload = {
    name: data.name,
    slug,
    description: data.description || "",
    longDescription: sanitizeProductHtml(data.longDescription || ""),
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

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath(`/product/${slug}`);
  redirect("/admin/products");
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
  const imageFile = formData.get("imageFile");
  if (imageFile instanceof File && imageFile.size > 0) {
    const { saveUploadedImage } = await import("@/lib/upload");
    image = await saveUploadedImage(imageFile, "categories");
  }
  const isActive = formBool(formData, "isActive");

  if (title.length < 2) throw new Error("Category title is required");

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

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath("/");
  redirect("/admin/categories");
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
  const imageFile = formData.get("imageFile");
  if (imageFile instanceof File && imageFile.size > 0) {
    const { saveUploadedImage } = await import("@/lib/upload");
    image = await saveUploadedImage(imageFile, "brands");
  }
  const isActive = formBool(formData, "isActive");

  if (title.length < 2) throw new Error("Brand title is required");

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

  revalidatePath("/admin/brands");
  revalidatePath("/");
  redirect("/admin/brands");
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
