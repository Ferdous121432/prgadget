import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/db/prisma";
import { getSimilarProducts } from "@/lib/actions/vector-search.actions";
import { getRelatedProducts } from "@/lib/actions/product.actions";

type RelativeProductsProps = {
  productId: string;
  // Optional hints for fallback when vectors are missing
  mainCategory?: string | null;
  subCategory?: string | null;
  brand?: string | null;
};

export default async function RelativeProducts({
  productId,
  brand,
}: RelativeProductsProps) {
  noStore();

  // 1) Try vector-based similar products
  const { data: vectorSimilar = [] } = await getSimilarProducts(productId, 5);

  let items =
    vectorSimilar?.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      image: Array.isArray(p.images) ? p.images[0] : p.images || "",
      rating: p.rating ?? 0,
    })) ?? [];

  // 2) Fallback to DB query if no vectors found
  if (!items.length) {
    items = (await getRelatedProducts(productId, brand ?? undefined)) as any[];
  }

  if (!items.length) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Related products</h2>
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
