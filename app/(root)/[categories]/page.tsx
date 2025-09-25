import React from "react";
import CategoryProducts from "@/components/shared/category/CategoryProducts";
import { getCategoryBySlug } from "@/lib/actions/category.actions";
import FilterSidebar from "@/components/sidebar/filter-sidebar-layout";

export const metadata = {
  title: "Categories",
  description: "Explore our categories",
};

async function page(props: { params: { categories: string } }) {
  const { categories } = await props.params;

  const { data: category } = (await getCategoryBySlug(categories)) as any;
  console.log("category by slug", category);

  if (!category) {
    return <div>Category not found</div>;
  }

  return (
    <div>
      <FilterSidebar>
        <CategoryProducts products={category.products} />
      </FilterSidebar>
    </div>
  );
}

export default page;
