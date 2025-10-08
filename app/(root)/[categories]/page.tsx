import React from "react";
import CategoryProducts from "@/components/shared/category/CategoryProducts";
import { getCategoryBySlug } from "@/lib/actions/category.actions";
import FilterSidebar from "@/components/sidebar/filter-sidebar-layout";

export const metadata = {
  title: "Categories",
  description: "Explore our categories",
};

async function page(props: {
  params: Promise<{ categories: string }>;
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
    rating?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const paramsObj = await props.params;
  const { categories } = paramsObj;
  const searchParamsObj = await props.searchParams; // Await the promise
  const { data: category } = (await getCategoryBySlug(categories)) as any;

  console.log({
    "categories param": categories,
    searchParams: searchParamsObj,
  });
  // console.log("category by slug", category);

  const initialFilters = {
    q: searchParamsObj.q ?? "all",
    category: searchParamsObj.category ?? "all",
    price: searchParamsObj.price ?? "all",
    rating: searchParamsObj.rating ?? "all",
    sort: searchParamsObj.sort ?? "newest",
    page: searchParamsObj.page ?? "1",
  };

  if (!category) {
    return <div>Category not found</div>;
  }

  return (
    <FilterSidebar>
      <CategoryProducts products={category.products} />
    </FilterSidebar>
  );
}

export default page;
