import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import Link from "next/link";
import ProductCard from "./product-card";

const ProductList = ({
  data,
  eyebrow,
  title,
  subtitle,
  limit,
  viewAllHref = "/search",
  viewAllLabel = "View all",
}: {
  data: Product[];
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  limit?: number;
  viewAllHref?: string;
  viewAllLabel?: string;
}) => {
  const productData = Array.isArray(data) ? data : [];
  const limitedData = limit ? productData.slice(0, limit) : productData;

  return (
    <section className="my-8 p-6 sm:p-8 sm:my-10 [content-visibility:auto] [contain-intrinsic-size:1px_860px]">
      {(eyebrow || title || subtitle) && (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-2">
            {eyebrow ? (
              <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-stone-500">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="text-3xl font-semibold uppercase tracking-[0.06em] text-stone-950 dark:text-white">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="text-sm leading-7 text-stone-600">{subtitle}</p>
            ) : null}
          </div>

          <Button
            asChild
            variant="outline"
            className="w-full rounded-full border-stone-300 bg-transparent sm:w-auto">
            <Link href={viewAllHref}>{viewAllLabel}</Link>
          </Button>
        </div>
      )}
      <div>
        {productData.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
            {limitedData.map((product: any) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div>
            <p>No products found</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductList;
