import PaginationComponent from "@/components/shared/product/Pagination";
import ProductCard from "@/components/shared/product/product-card";
import {
  CategoryFilter,
  type FilterSection,
} from "@/components/sidebar/filter";
import FilterSidebar from "@/components/sidebar/filter-sidebar-layout";
import { Button } from "@/components/ui/button";
import { getCategoryBySlug } from "@/lib/actions/category.actions";
import {
  getAllProducts,
  getProductBrands,
} from "@/lib/actions/product.actions";
import { ProductWithId } from "@/types";
import Link from "next/link";

const prices = [
  {
    name: "$1 to $50",
    value: "1-50",
  },
  {
    name: "$51 to $100",
    value: "51-100",
  },
  {
    name: "$101 to $200",
    value: "101-200",
  },
  {
    name: "$201 to $500",
    value: "201-500",
  },
  {
    name: "$501 to $1000",
    value: "501-1000",
  },
];

const ratings = [4, 3, 2, 1];

const stockOptions = [
  {
    name: "Any",
    value: "all",
  },
  {
    name: "In stock",
    value: "in-stock",
  },
  {
    name: "Out of stock",
    value: "out-of-stock",
  },
];

const sortOptions = [
  {
    label: "Newest",
    value: "newest",
  },
  {
    label: "Lowest price",
    value: "lowest",
  },
  {
    label: "Highest price",
    value: "highest",
  },
  {
    label: "Top rated",
    value: "rating",
  },
];

export const metadata = {
  title: "Categories",
  description: "Explore our categories",
};

async function page(props: {
  params: Promise<{ categories: string }>;
  searchParams: Promise<{
    q?: string;
    brand?: string;
    stock?: string;
    price?: string;
    rating?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const paramsObj = await props.params;
  const { categories } = paramsObj;
  const {
    q = "all",
    brand = "all",
    stock = "all",
    price = "all",
    rating = "all",
    sort = "newest",
    page = "1",
  } = await props.searchParams;
  const { data: category } = (await getCategoryBySlug(categories)) as any;

  if (!category) {
    return <div>Category not found</div>;
  }

  const currentPage = Number(page) || 1;

  const getFilterUrl = ({
    b,
    st,
    p,
    r,
    s,
    pg,
  }: {
    b?: string;
    st?: string;
    p?: string;
    r?: string;
    s?: string;
    pg?: string;
  }) => {
    const params = new URLSearchParams({
      q,
      brand,
      stock,
      price,
      rating,
      sort,
      page,
    });

    if (b !== undefined) params.set("brand", b);
    if (st !== undefined) params.set("stock", st);
    if (p !== undefined) params.set("price", p);
    if (r !== undefined) params.set("rating", r);
    if (s !== undefined) params.set("sort", s);
    if (pg !== undefined) params.set("page", pg);

    return `/category/${categories}?${params.toString()}`;
  };

  const [products, brands] = (await Promise.all([
    getAllProducts({
      query: q,
      category: category.name,
      brand,
      stock,
      price,
      rating,
      sort,
      page: currentPage,
    }),
    getProductBrands(category.name),
  ])) as [
    {
      data: ProductWithId[];
      totalPages: number;
    },
    string[],
  ];

  const filterSections: FilterSection[] = [
    {
      title: "Brand",
      options: [
        {
          label: "Any",
          href: getFilterUrl({ b: "all", pg: "1" }),
          active: brand === "all" || brand === "",
        },
        ...brands.map((item) => ({
          label: item,
          href: getFilterUrl({ b: item, pg: "1" }),
          active: brand === item,
        })),
      ],
    },
    {
      title: "Availability",
      options: stockOptions.map((item) => ({
        label: item.name,
        href: getFilterUrl({ st: item.value, pg: "1" }),
        active: stock === item.value,
      })),
    },
    {
      title: "Price",
      options: [
        {
          label: "Any",
          href: getFilterUrl({ p: "all", pg: "1" }),
          active: price === "all",
        },
        ...prices.map((item) => ({
          label: item.name,
          href: getFilterUrl({ p: item.value, pg: "1" }),
          active: price === item.value,
        })),
      ],
    },
    {
      title: "Customer ratings",
      options: [
        {
          label: "Any",
          href: getFilterUrl({ r: "all", pg: "1" }),
          active: rating === "all",
        },
        ...ratings.map((item) => ({
          label: `${item} stars & up`,
          href: getFilterUrl({ r: `${item}`, pg: "1" }),
          active: rating === item.toString(),
        })),
      ],
    },
  ];

  const hasActiveFilters =
    brand !== "all" || stock !== "all" || price !== "all" || rating !== "all";

  return (
    <FilterSidebar sidebar={<CategoryFilter sections={filterSections} />}>
      <div className="space-y-4">
        <div className="flex-between my-4 flex-col gap-4 md:flex-row">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span>
              Category: <span className="font-semibold">{category.name}</span>
            </span>
            {brand !== "all" && brand !== "" && <span>Brand: {brand}</span>}
            {stock !== "all" && <span>Availability: {stock}</span>}
            {price !== "all" && <span>Price: {price}</span>}
            {rating !== "all" && <span>Rating: {rating} stars & up</span>}
            {hasActiveFilters ? (
              <Button variant="link" asChild>
                <Link href={`/category/${categories}`}>Clear</Link>
              </Button>
            ) : null}
          </div>

          <div>
            Sort by{" "}
            {sortOptions.map((option) => (
              <Link
                key={option.value}
                className={`mx-2 ${sort === option.value ? "font-bold" : ""}`}
                href={getFilterUrl({ s: option.value, pg: "1" })}>
                {option.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background px-4 py-4 text-sm text-muted-foreground">
          {products.data.length === 0
            ? `No products found in ${category.name} for the selected filters.`
            : `Showing page ${currentPage} of ${products.totalPages} in ${category.name}.`}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.data.length === 0 ? (
            <div className="col-span-full py-8 text-center text-muted-foreground">
              No products matched the current filters.
            </div>
          ) : (
            products.data.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))
          )}
        </div>

        <PaginationComponent
          currentPage={currentPage}
          totalPages={products.totalPages}
          baseUrl={`/category/${categories}`}
          searchParams={{
            q,
            brand,
            stock,
            price,
            rating,
            sort,
          }}
        />
      </div>
    </FilterSidebar>
  );
}

export default page;
