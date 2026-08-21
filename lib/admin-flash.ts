import { redirect } from "next/navigation";

/** Redirect to an admin path with a success or error flash in the query string. */
export function redirectWithFlash(
  path: string,
  flash: { saved?: boolean; error?: string; edit?: string },
): never {
  const url = new URL(path, "http://localhost");
  if (flash.saved) url.searchParams.set("saved", "1");
  if (flash.error) url.searchParams.set("error", flash.error);
  if (flash.edit) url.searchParams.set("edit", flash.edit);
  redirect(`${url.pathname}${url.search}`);
}

export function firstZodMessage(
  issues: { path: (string | number)[]; message: string }[],
): string {
  const issue = issues[0];
  if (!issue) return "Please fill in all required fields";
  const field = String(issue.path[0] ?? "");
  const labels: Record<string, string> = {
    name: "Name",
    sku: "SKU",
    price: "Price",
    purchasePrice: "Purchase price",
    stock: "Stock",
    categoryId: "Category",
    brandId: "Brand",
    imageUrl: "Product image",
    title: "Title",
    slug: "Slug",
    headline: "Headline",
  };
  const label = labels[field] || field || "Field";
  if (
    issue.message.toLowerCase().includes("required") ||
    issue.message.includes("at least")
  ) {
    return issue.message.includes("required")
      ? issue.message
      : `${label} is required`;
  }
  if (issue.message.includes("Invalid") || field.endsWith("Id")) {
    return `Please select a valid ${label.toLowerCase()}`;
  }
  return issue.message.startsWith(label) ? issue.message : `${label}: ${issue.message}`;
}
