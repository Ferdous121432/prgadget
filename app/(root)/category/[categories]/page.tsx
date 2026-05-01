import CategoryProducts from "@/components/shared/category/CategoryProducts";
import FilterSidebar from "@/components/sidebar/filter-sidebar-layout";
import { getCategoryBySlug } from "@/lib/actions/category.actions";

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

  // console.log({
  //   "categories param": categories,
  //   searchParams: searchParamsObj,
  // });
  // console.log("category by slug", category);

  if (!category) {
    return <div>Category not found</div>;
  }

  return (
    <FilterSidebar
      sidebar={
        <div className="rounded-2xl border border-border bg-background px-4 py-4 text-sm text-muted-foreground">
          Browse products in {category.name}.
        </div>
      }>
      <CategoryProducts products={category.products} />
    </FilterSidebar>
  );
}

export default page;
