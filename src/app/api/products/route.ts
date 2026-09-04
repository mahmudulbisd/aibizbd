import { NextResponse } from "next/server";
import { getActiveProducts, getProductBySlug } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const product = await getProductBySlug(slug);
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      return NextResponse.json({ product });
    }

    const products = await getActiveProducts();
    return NextResponse.json({
      success: true,
      count: products.length,
      source: "ProdSeller Live API",
      products,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
