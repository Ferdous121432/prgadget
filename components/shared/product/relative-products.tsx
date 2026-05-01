import Link from "next/link";

import { getRelatedProducts } from "@/lib/actions/product.actions";
import { getSimilarProducts } from "@/lib/actions/vector-search.actions";

type RelativeProductsProps = {
  productId: string;
  // Optional hints for fallback when vectors are missing
  mainCategoryId?: string | null;
  subCategoryId?: string | null;
  subSubCategoryId?: string | null;
  brand?: string | null;
};

export default async function RelativeProducts({
  productId,
  mainCategoryId,
  subCategoryId,
  subSubCategoryId,
  brand,
}: RelativeProductsProps) {
  // Start with deterministic category-aware SQL recommendations.
  const sqlItems = (await getRelatedProducts(
    productId,
    mainCategoryId ?? undefined,
    subCategoryId ?? undefined,
    subSubCategoryId ?? undefined,
    brand ?? undefined,
  )) as any[];

  let items = [...sqlItems];

  // Use semantic vectors as a supplement when SQL matches are sparse.
  if (items.length < 5) {
    const { data: vectorSimilar = [] } = await getSimilarProducts(
      productId,
      10,
    );
    const vectorItems =
      vectorSimilar?.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        image: Array.isArray(p.images) ? p.images[0] : p.images || "",
        rating: p.rating ?? 0,
      })) ?? [];

    const existingIds = new Set(items.map((item) => item.id));
    for (const item of vectorItems) {
      if (!existingIds.has(item.id)) {
        items.push(item);
        existingIds.add(item.id);
      }

      if (items.length >= 5) {
        break;
      }
    }
  }

  if (!items.length) return null;

  const heading =
    sqlItems.length > 0 ? "Similar products" : "You may also like";

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold mb-4">{heading}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.slice(0, 5).map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.slug}`}
            className="border rounded-md p-3 hover:shadow-sm transition">
            <div className="aspect-square bg-gray-100 overflow-hidden rounded">
              {/* Use next/image if you have domains configured */}
              {/* <Image src={p.image ?? "/placeholder.png"} alt={p.name} fill className="object-cover" /> */}
              <img
                src={p.image || "/placeholder.png"}
                alt={p.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="mt-2 text-sm line-clamp-2">{p.name}</div>
            <div className="mt-1 font-semibold">
              ${Number(p.price).toFixed(2)}
            </div>
            {p.rating ? (
              <div className="text-xs text-muted-foreground">
                ⭐ {Number(p.rating).toFixed(1)}
              </div>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
