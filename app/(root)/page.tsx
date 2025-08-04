import ProductList from "@/components/shared/product/product-list";
import { getLatestProducts } from "@/lib/actions/product.actions";
import { LATEST_PRODUCTS_LIMIT } from "@/lib/constants";
import { Product } from "@/types";

import React from "react";

// Force dynamic rendering to avoid build-time database calls
export const dynamic = 'force-dynamic';

// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const Page = async () => {
  const latestProducts = await getLatestProducts();

  return (
    <>
      <ProductList
        data={latestProducts as Product[]}
        title="Newest Arrival"
        limit={LATEST_PRODUCTS_LIMIT}
      />
    </>
  );
};

export default Page;
