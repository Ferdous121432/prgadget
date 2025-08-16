import DealCountdown from "@/components/DealCountdown";
import IconBoxes from "@/components/IconBoxes";
import ProductList from "@/components/shared/product/product-list";
import ProductCarousel from "@/components/shared/product/ProductCarousel";
import ViewAllProductsButton from "@/components/ViewAllProductsButton";
import {
  getFeaturedProducts,
  getLatestProducts,
} from "@/lib/actions/product.actions";
import { LATEST_PRODUCTS_LIMIT } from "@/lib/constants";
import { ProductWithId } from "@/types";

import React from "react";

// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const Page = async () => {
  const latestProducts = (await getLatestProducts()) as ProductWithId[];
  const featuredProducts = (await getFeaturedProducts()) as ProductWithId[];

  return (
    <>
      {featuredProducts.length > 0 && (
        <ProductCarousel data={featuredProducts} />
      )}

      <ProductList
        data={latestProducts}
        title="Newest Arrival"
        limit={LATEST_PRODUCTS_LIMIT}
      />
      <ViewAllProductsButton />
      <DealCountdown />
      <IconBoxes />
    </>
  );
};

export default Page;
