import DealCountdown from "@/components/DealCountdown";
import IconBoxes from "@/components/IconBoxes";
import FeaturedCategory from "@/components/shared/homepage/FeaturedCategory";
import ProductList from "@/components/shared/product/product-list";
import ProductCarousel from "@/components/shared/product/ProductCarousel";
import { getAllHomeSliders } from "@/lib/actions/homepage.actions";
import {
  getFeaturedProducts,
  getLatestProducts,
} from "@/lib/actions/product.actions";
import { LATEST_PRODUCTS_LIMIT } from "@/lib/constants";
import { ProductWithId } from "@/types";

import React from "react";

// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type HomeSlider = {
  id: string;
  // image_Key: string;
  image_url: string;
  image_name: string;
  linked_url: string;
  createdAt: Date;
  updatedAt: Date;
};

const Page = async () => {
  const featuredProducts = (await getFeaturedProducts()) as ProductWithId[];
  const latestProducts = (await getLatestProducts()) as ProductWithId[];
  const homeSlider: HomeSlider[] = await getAllHomeSliders();

  return (
    <>
      {homeSlider.length > 0 && <ProductCarousel data={homeSlider} />}
      <IconBoxes />
      <ProductList
        data={featuredProducts}
        title="Featured Products"
        limit={LATEST_PRODUCTS_LIMIT}
      />
      <ProductList
        data={latestProducts}
        title="Newest Arrival"
        limit={LATEST_PRODUCTS_LIMIT}
      />
      <FeaturedCategory />

      <DealCountdown />
    </>
  );
};

export default Page;
