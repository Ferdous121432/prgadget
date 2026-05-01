import {
  getAllProducts,
  getProductByIdNoCache,
  getProductBySlug,
} from "@/lib/actions/product.actions";
import { NextRequest, NextResponse } from "next/server";

// Simple public GET route for Postman testing
export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const id = params.get("id");
    const slug = params.get("slug");

    if (id) {
      const product = await getProductByIdNoCache(id);
      return NextResponse.json(product);
    }

    if (slug) {
      const product = await getProductBySlug(slug);
      return NextResponse.json(product);
    }

    const query = params.get("query") || "all";
    const page = Number(params.get("page") || "1");
    const limit = Number(params.get("limit") || "20");
    const category = params.get("category") || undefined;
    const price = params.get("price") || undefined;
    const rating = params.get("rating") || undefined;
    const sort = params.get("sort") || undefined;
    const useVectorSearch = params.get("useVectorSearch") === "true";

    const result = await getAllProducts({
      query,
      page,
      limit,
      category,
      price,
      rating,
      sort,
      useVectorSearch,
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
