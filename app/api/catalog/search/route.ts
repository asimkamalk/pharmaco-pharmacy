import { NextResponse } from "next/server";
import { getBrands, getCategories, searchProducts } from "@/lib/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json({ products: [], categories: [], brands: [] });
  }

  const [products, categories, brands] = await Promise.all([
    searchProducts(q, 6),
    getCategories(),
    getBrands(),
  ]);

  const lower = q.toLowerCase();
  return NextResponse.json({
    products,
    categories: categories
      .filter((category) => category.title.toLowerCase().includes(lower))
      .slice(0, 3),
    brands: brands
      .filter((brand) => brand.title.toLowerCase().includes(lower))
      .slice(0, 3),
  });
}
