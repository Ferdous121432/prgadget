import { Metadata } from "next";
import { Suspense } from "react";

import DealCountdown from "@/components/DealCountdown";
import IconBoxes from "@/components/IconBoxes";
import FeaturedCategory from "@/components/shared/homepage/FeaturedCategory";
import ProductList from "@/components/shared/product/product-list";
import ProductCarousel from "@/components/shared/product/ProductCarousel";

import { ProductWithId } from "@/types";

import { getAllHomeSliders } from "@/lib/actions/homepage.actions";
import {
  getFeaturedProducts,
  getLatestProducts,
} from "@/lib/actions/product.actions";

import { LATEST_PRODUCTS_LIMIT } from "@/lib/constants";
import { featuredCategoryLogos as categories } from "@/lib/constants";
import { featuredBrands as brands } from "@/lib/constants";

type HomeSlider = {
  id: string;
  image_url: string;
  image_name: string;
  linked_url: string;
  createdAt: Date;
  updatedAt: Date;
};

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
  return homeSlider.length > 0 ? <ProductCarousel data={homeSlider} /> : null;
}

async function FeaturedProductList() {
  const featuredProducts = (await getFeaturedProducts()) as ProductWithId[];
  return (
    <ProductList
      data={featuredProducts}
      title="Featured Products"
      limit={LATEST_PRODUCTS_LIMIT}
    />
  );
}

async function LatestProductList() {
  const latestProducts = (await getLatestProducts()) as ProductWithId[];
  return (
    <ProductList
      data={latestProducts}
      title="Newest Arrival"
      limit={LATEST_PRODUCTS_LIMIT}
    />
  );
}

const Page = async () => {
  return (
    <>
      {/* Above-the-fold carousel - highest priority */}
      <Suspense fallback={<CarouselSkeleton />}>
        <HomeCarousel />
      </Suspense>

      {/* Static content - no loading needed */}
      <IconBoxes />

      {/* Featured products - second priority */}
      <Suspense fallback={<ProductListSkeleton />}>
        <FeaturedProductList />
      </Suspense>

      {/* Categories - fourth priority */}
      <Suspense fallback={<CategorySkeleton />}>
        <FeaturedCategory categories={categories} />
      </Suspense>

      {/* Latest products - third priority */}
      <Suspense fallback={<ProductListSkeleton />}>
        <LatestProductList />
      </Suspense>

      {/* Brands - fourth priority */}
      <Suspense fallback={<CategorySkeleton />}>
        <FeaturedCategory categories={brands} />
      </Suspense>

      {/* Static content at bottom */}
      <DealCountdown />
    </>
  );
};

export default Page;
