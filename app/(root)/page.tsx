import { ArrowRight, ChevronRight } from "lucide-react";
import { Metadata } from "next";
import nextDynamic from "next/dynamic";
import Link from "next/link";
import { Suspense } from "react";

import FeaturedCategory from "@/components/shared/homepage/FeaturedCategory";
import ProductList from "@/components/shared/product/product-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { ProductWithId } from "@/types";

import { getAllHomeSliders } from "@/lib/actions/homepage.actions";
import {
  getFeaturedProducts,
  getLatestProducts,
} from "@/lib/actions/product.actions";

import {
  featuredBrands as brands,
  featuredCategoryLogos as featuredCategories,
  LATEST_PRODUCTS_LIMIT,
  categories as storefrontDepartments,
} from "@/lib/constants";

// ProductCarousel uses client-side carousel, but SSR the initial content for SEO
const ProductCarousel = nextDynamic(
  () => import("@/components/shared/product/ProductCarousel"),
  {
    ssr: true, // Keep SSR for LCP - first slide should be server rendered
    loading: () => (
      <div className="w-full h-64 md:h-96 bg-gray-200 animate-pulse rounded-lg" />
    ),
  },
);

type HomeSlider = {
  id: string;
  image_url: string;
  image_name: string;
  linked_url: string;
  createdAt: Date;
  updatedAt: Date;
};

const campaignRail = [
  {
    title: "Monsoon-ready mobile gear",
    description:
      "Portable power, fast charging, and daily-carry accessories with high repeat demand.",
    href: "/category/phone-accessories",
    tone: "bg-stone-100 text-stone-900",
  },
  {
    title: "Desk setups with real staying power",
    description:
      "Tablets, laptops, and work essentials grouped like a focused seasonal collection.",
    href: "/category/laptop",
    tone: "bg-[#ece8df] text-stone-900",
  },
  {
    title: "Audio for commuting and downtime",
    description:
      "Earphones, speakers, and giftable picks surfaced in a cleaner discovery path.",
    href: "/category/headphones-earphones",
    tone: "bg-stone-900 text-white",
  },
];

const campaignHighlights = [
  {
    eyebrow: "Feature drop",
    title: "A campaign layout that leads with product mood, not admin widgets",
    description:
      "Use the homepage like a seasonal storefront: strong hero, category entry points, and product rails that feel curated.",
    href: "/category/phone-accessories",
  },
  {
    eyebrow: "Category edit",
    title: "Build demand around departments shoppers already understand",
    description:
      "Phones, tablets, audio, and accessories should be presented like a clean retail taxonomy with clear callouts.",
    href: "/category/phones",
  },
  {
    eyebrow: "Editorial note",
    title: "Replace utility-heavy sections with story-led merchandising",
    description:
      "Lower homepage sections can promote arrivals, category spotlights, and brand stories without feeling generic.",
    href: "/search?sort=newest",
  },
];

const departmentTabs = [
  {
    label: "Phones",
    href: "/category/phones",
  },
  {
    label: "Audio",
    href: "/category/headphones-earphones",
  },
  {
    label: "Tablets",
    href: "/category/tablet",
  },
  {
    label: "Accessories",
    href: "/category/phone-accessories",
  },
];

const magazineStories = [
  {
    eyebrow: "Journal",
    title: "How to merchandise a gadget homepage like a fashion campaign",
    description:
      "Lead with a strong seasonal frame, then make category and new-arrival browsing feel effortless.",
    href: "/search?sort=newest",
  },
  {
    eyebrow: "Retail memo",
    title: "Three product groups that should always appear above the fold",
    description:
      "Mobile accessories, hero devices, and a giftable audio lane do the most work in a compact first impression.",
    href: "/category/phone-accessories",
  },
  {
    eyebrow: "Store update",
    title:
      "Brand-led browsing still matters when shoppers already know the ecosystem",
    description:
      "Keep the brand strip, but place it after the product story so it supports discovery instead of replacing it.",
    href: "/search",
  },
];

function buildSearchHref(query: string) {
  return `/search?${new URLSearchParams({ q: query }).toString()}`;
}

// Add metadata
export const metadata: Metadata = {
  title: "PR Gadget - Latest Electronics & Gadgets",
  description:
    "Discover the latest electronics, gadgets, and tech products at unbeatable prices.",
  openGraph: {
    title: "PR Gadget - Latest Electronics & Gadgets",
    description:
      "Discover the latest electronics, gadgets, and tech products at unbeatable prices.",
  },
};

export const revalidate = 3600; // Revalidate every hour
export const dynamic = "force-static";
export const dynamicParams = true;

// Loading components
const CarouselSkeleton = () => (
  <div className="w-full h-64 md:h-96 bg-gray-200 animate-pulse rounded-lg" />
);

const ProductListSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="h-8 bg-gray-200 animate-pulse rounded w-48 mb-6" />
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array(8)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
            <div className="h-4 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
          </div>
        ))}
    </div>
  </div>
);

const CategorySkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="h-8 bg-gray-200 animate-pulse rounded w-48 mb-6" />
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <div className="w-20 h-20 bg-gray-200 animate-pulse rounded-full mx-auto" />
            <div className="h-4 bg-gray-200 animate-pulse rounded" />
          </div>
        ))}
    </div>
  </div>
);

// Separate components for each data fetch
async function HomeCarousel() {
  const homeSlider = (await getAllHomeSliders()) as HomeSlider[];

  if (homeSlider.length > 0) {
    return <ProductCarousel data={homeSlider} />;
  }

  return (
    <div className="flex min-h-[420px] flex-col justify-end rounded-[32px] bg-[linear-gradient(135deg,#171717_0%,#2b2117_45%,#8b5e34_100%)] p-6 text-white sm:min-h-[520px] sm:p-8 lg:p-10">
      <Badge className="mb-4 w-fit rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-white hover:bg-white/10">
        Spring 2026 edit
      </Badge>
      <div className="max-w-2xl space-y-4">
        <h1 className="text-3xl font-semibold uppercase tracking-[0.08em] sm:text-5xl lg:text-6xl">
          Discover a more editorial way to shop gadgets.
        </h1>
        <p className="max-w-xl text-sm leading-7 text-stone-200 sm:text-base">
          Campaign-led hero storytelling, trending departments, fresh arrivals,
          and brand discovery arranged like a polished retail homepage rather
          than a raw catalog feed.
        </p>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button
          asChild
          size="lg"
          className="w-full rounded-full bg-white px-6 text-stone-950 hover:bg-stone-100 sm:w-auto">
          <Link href="/search?sort=newest">
            Shop new arrivals
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="w-full rounded-full border-white/30 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white sm:w-auto">
          <Link href="/category/phones">Browse departments</Link>
        </Button>
      </div>
    </div>
  );
}

async function FeaturedProductList() {
  const featuredProducts = (await getFeaturedProducts()) as ProductWithId[];
  return (
    <ProductList
      data={featuredProducts}
      eyebrow="Editors' picks"
      title="Seasonal standouts"
      subtitle="A tighter product rail for high-attention devices and accessories that deserve front-page placement."
      limit={LATEST_PRODUCTS_LIMIT}
      viewAllHref="/search?sort=rating"
      viewAllLabel="See all"
    />
  );
}

async function LatestProductList() {
  const latestProducts = (await getLatestProducts()) as ProductWithId[];
  return (
    <ProductList
      data={latestProducts}
      eyebrow="New arrivals"
      title="Latest drops"
      subtitle="Fresh additions presented like a retail rail, with quick paths into your most active departments."
      limit={LATEST_PRODUCTS_LIMIT}
      viewAllHref="/search?sort=newest"
      viewAllLabel="See all"
    />
  );
}

const Page = async () => {
  return (
    <div className="space-y-12 bg-[#f8f3ea] pb-16 text-stone-900 sm:space-y-16">
      {/* Section: Hero carousel + campaign intro rail */}
      <section className="grid gap-4 ">
        <Suspense fallback={<CarouselSkeleton />}>
          <HomeCarousel />
        </Suspense>

        <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-2  ">
          <Card className="overflow-hidden rounded-4xl border border-stone-200 bg-white shadow-none">
            <CardContent className="flex min-h-55 flex-col justify-between p-6 sm:p-8">
              <div className="space-y-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-stone-500">
                  Campaign spotlight
                </p>
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold uppercase tracking-[0.06em] text-stone-950">
                    Trend-led discovery for phones, tablets, and audio.
                  </h2>
                  <p className="text-sm leading-6 text-stone-600">
                    This section mirrors the reference structure: a high-impact
                    hero on the left and smaller campaign pushes stacked beside
                    it for faster browsing.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="w-full rounded-full bg-stone-900 text-white hover:bg-stone-800 sm:w-auto">
                  <Link href="/search?sort=rating">Shop best sellers</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full justify-start rounded-full px-0 text-stone-900 hover:bg-transparent sm:w-auto">
                  <Link href="/search">
                    View catalog
                    <ChevronRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 grid-cols-1">
            {campaignRail.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className={`rounded-[28px] p-6 transition hover:-translate-y-0.5 ${item.tone}`}>
                <div className="space-y-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.28em] opacity-70">
                    Curated lane
                  </p>
                  <h2 className="text-xl font-semibold uppercase tracking-[0.05em]">
                    {item.title}
                  </h2>
                  <p className="text-sm leading-6 opacity-80">
                    {item.description}
                  </p>
                  <div className="flex items-center pt-2 text-sm font-medium uppercase tracking-[0.16em]">
                    Explore
                    <ArrowRight className="ml-2 size-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Trending categories with quick department tabs */}
      <section className="space-y-6">
        <div className="flex flex-col p-6 sm:p-8 gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-stone-500">
              Trending categories
            </p>
            <h2 className="text-3xl font-semibold uppercase tracking-[0.06em] text-stone-950">
              Shop the departments moving fastest right now.
            </h2>
          </div>

          <div className="flex  flex-wrap gap-2">
            {departmentTabs.map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                className="rounded-full border border-stone-300 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-stone-700 transition hover:border-stone-900 hover:text-stone-950">
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        <Suspense fallback={<CategorySkeleton />}>
          <FeaturedCategory
            categories={featuredCategories}
            title="Trending categories"
            subtitle="A quick category showcase inspired by campaign-led retail homepages, adapted to your gadget catalog."
          />
        </Suspense>
      </section>

      {/* Section: Campaign highlight cards */}
      <section className="grid gap-4 lg:grid-cols-3 [content-visibility:auto] [contain-intrinsic-size:1px_500px]">
        {campaignHighlights.map((card) => (
          <Card
            key={card.title}
            className="rounded-[32px] border border-stone-200 bg-white shadow-none">
            <CardContent className="flex h-full flex-col gap-4 p-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-stone-500">
                {card.eyebrow}
              </p>
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold uppercase tracking-[0.05em] text-stone-950">
                  {card.title}
                </h2>
                <p className="text-sm leading-7 text-stone-600">
                  {card.description}
                </p>
              </div>
              <Button
                asChild
                variant="ghost"
                className="mt-auto justify-start px-0 text-stone-900 hover:bg-transparent hover:text-stone-700">
                <Link href={card.href}>
                  Read the section
                  <ChevronRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <Suspense fallback={<ProductListSkeleton />}>
        <LatestProductList />
      </Suspense>

      {/* Section: Featured products + retail direction panel */}
      <section className="grid gap-5  [content-visibility:auto] [contain-intrinsic-size:1px_780px]">
        <Suspense fallback={<ProductListSkeleton />}>
          <FeaturedProductList />
        </Suspense>

        <Card className="rounded-[32px] border border-stone-200 bg-[#e9dfcf] shadow-none">
          <CardContent className="flex h-full flex-col justify-between p-6 sm:p-8">
            <div className="space-y-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-stone-600">
                Retail direction
              </p>
              <h2 className="text-3xl font-semibold uppercase tracking-[0.06em] text-stone-950">
                Keep the homepage moving between product, category, and story.
              </h2>
              <p className="text-sm leading-7 text-stone-700">
                The reference site works because it alternates visual campaigns,
                category moments, and product rails. This version applies that
                cadence to electronics using your existing data sources.
              </p>
            </div>

            <div className="mt-8 space-y-3 border-t border-stone-400/30 pt-6">
              {storefrontDepartments.slice(0, 4).map((department) => (
                <Link
                  key={department.id}
                  href={`/category/${department.url}`}
                  className="flex items-center justify-between border-b border-stone-400/20 py-3 text-sm font-medium uppercase tracking-[0.18em] text-stone-800 last:border-b-0">
                  <span>{department.name}</span>
                  <ChevronRight className="size-4" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section: Editorial magazine stories */}
      <section className="space-y-6 p-6 sm:p-8 [content-visibility:auto] [contain-intrinsic-size:1px_780px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-stone-500">
              Magazine
            </p>
            <h2 className="text-3xl font-semibold uppercase tracking-[0.06em] text-stone-950">
              Brand stories and shopping notes keep the homepage alive.
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-stone-600">
              Inspired by the editorial block on the reference site, this area
              gives your homepage a richer lower fold without requiring a full
              blog system to start.
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="w-full rounded-full border-stone-300 bg-transparent sm:w-auto">
            <Link href="/search?sort=newest">View more</Link>
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {magazineStories.map((story) => (
            <Link
              key={story.title}
              href={story.href}
              className="rounded-[32px] border border-stone-200 bg-white p-6 transition hover:-translate-y-0.5">
              <div className="space-y-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-stone-500">
                  {story.eyebrow}
                </p>
                <h3 className="text-2xl font-semibold uppercase tracking-[0.05em] text-stone-950">
                  {story.title}
                </h3>
                <p className="text-sm leading-7 text-stone-600">
                  {story.description}
                </p>
                <div className="flex items-center text-sm font-medium uppercase tracking-[0.18em] text-stone-900">
                  Read story
                  <ArrowRight className="ml-2 size-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Section: Brand rooms / brand discovery grid */}
      <section className="space-y-6 p-6 sm:p-8 [content-visibility:auto] [contain-intrinsic-size:1px_420px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-stone-500">
              Brand rooms
            </p>
            <h2 className="text-3xl font-semibold uppercase tracking-[0.06em] text-stone-950">
              Browse by brand after the product story lands.
            </h2>
          </div>

          <Button
            asChild
            variant="outline"
            className="w-full rounded-full border-stone-300 bg-transparent sm:w-auto">
            <Link href="/search">Shop all products</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={buildSearchHref(brand.name)}
              className="group rounded-[28px] border border-stone-200 bg-white p-5 text-center transition hover:-translate-y-0.5">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-stone-900">
                {brand.name}
              </div>
              <div className="mt-2 text-[11px] uppercase tracking-[0.22em] text-stone-500">
                Explore
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Page;
