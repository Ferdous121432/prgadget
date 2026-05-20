import Image, { StaticImageData } from "next/image";
// import { getFeaturedCategories } from "@/lib/actions/category.actions";
import Link from "next/link";

type FeaturedCategories = {
  id: number;
  name: string;
  link?: string;
  image: StaticImageData;
};

function FeaturedCategory({
  categories,
  title = "Featured Categories",
  subtitle,
}: {
  categories: FeaturedCategories[];
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="rounded-4xl border border-stone-200 bg-white p-6 shadow-none sm:p-8 [content-visibility:auto] [contain-intrinsic-size:1px_500px]">
      <div className="mb-6 space-y-2">
        <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-stone-500">
          Browse faster
        </div>
        <div className="text-3xl font-semibold uppercase tracking-[0.06em] text-stone-950">
          {title}
        </div>
        {subtitle ? (
          <p className="max-w-2xl text-sm leading-7 text-stone-600">
            {subtitle}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4  2xl:grid-cols-8">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.link}`}
            className="group rounded-[28px] border border-stone-200 bg-[#f8f3ea] p-4 text-center transition hover:-translate-y-0.5 hover:border-stone-400 sm:p-5">
            <div className="space-y-3">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white transition group-hover:bg-stone-100">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={80}
                  height={80}
                  loading="lazy"
                  sizes="50px"
                />
              </div>
              <div className="text-sm font-semibold uppercase tracking-[0.08em] text-stone-900">
                {category.name}
              </div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-stone-500">
                Shop category
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default FeaturedCategory;
