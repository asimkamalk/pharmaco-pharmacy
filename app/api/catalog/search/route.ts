import { NextResponse } from "next/server";
import {
  getBestSellers,
  getBrands,
  getCategories,
  getFeaturedProducts,
  searchProducts,
} from "@/lib/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  // Empty query → suggestions for the open search dialog
  if (!q) {
    const [featured, bestSellers, categories, brands] = await Promise.all([
      getFeaturedProducts(4),
      getBestSellers(4),
      getCategories(),
      getBrands(),
    ]);

    const seen = new Set<string>();
    const products = [...featured, ...bestSellers]
      .filter((product) => {
        if (seen.has(product.id)) return false;
        seen.add(product.id);
        return true;
      })
      .slice(0, 6);

    return NextResponse.json({
      products,
      categories: categories.slice(0, 6),
      brands: brands.slice(0, 6),
      suggestions: true,
    });
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
      .slice(0, 4),
    brands: brands
      .filter((brand) => brand.title.toLowerCase().includes(lower))
      .slice(0, 4),
    suggestions: false,
  });
}
