import ProductList from "@/components/shared/product/product-list";
import sampleData from "@/db/sample-data";
import Image from "next/image";
import React from "react";

// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const Page = async () => {
  // await delay(2000);
  return (
    <>
      <ProductList
        data={sampleData.products}
        title="Newest Arrival"
        limit={4}
      />
    </>
  );
};

export default Page;
