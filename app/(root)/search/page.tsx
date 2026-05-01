import PaginationComponent from "@/components/shared/product/Pagination";
import ProductCard from "@/components/shared/product/product-card";
import VectorSearchToggle from "@/components/shared/vector-search-toggle-searchpage";
import {
  CategoryFilter,
  type FilterSection,
} from "@/components/sidebar/filter";
import FilterSidebar from "@/components/sidebar/filter-sidebar-layout";
import { Button } from "@/components/ui/button";
import { getAllMainCategories } from "@/lib/actions/category.actions";
import {
  getAllProducts,
  getProductBrands,
} from "@/lib/actions/product.actions";
import { MainCategory } from "@/lib/generated/prisma";
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

const sortOrders = ["newest", "lowest", "highest", "rating"];

export async function generateMetadata(props: {
  searchParams: Promise<{
    q: string;
    category: string;
    brand: string;
    stock: string;
    price: string;
    rating: string;
  }>;
}) {
  const {
    q = "all",
    category = "all",
    brand = "all",
    stock = "all",
    price = "all",
    rating = "all",
  } = await props.searchParams;

  const isQuerySet = q && q !== "all" && q.trim() !== "";
  const isCategorySet =
    category && category !== "all" && category.trim() !== "";
  const isBrandSet = brand && brand !== "all" && brand.trim() !== "";
  const isStockSet = stock && stock !== "all" && stock.trim() !== "";
  const isPriceSet = price && price !== "all" && price.trim() !== "";
  const isRatingSet = rating && rating !== "all" && rating.trim() !== "";

  if (
    isQuerySet ||
    isCategorySet ||
    isBrandSet ||
    isStockSet ||
    isPriceSet ||
    isRatingSet
  ) {
    return {
      title: `
      Search ${isQuerySet ? q : ""} 
      ${isCategorySet ? `: Category ${category}` : ""}
      ${isBrandSet ? `: Brand ${brand}` : ""}
      ${isStockSet ? `: Availability ${stock}` : ""}
      ${isPriceSet ? `: Price ${price}` : ""}
      ${isRatingSet ? `: Rating ${rating}` : ""}`,
    };
  } else {
    return {
      title: "Search Products",
    };
  }
}

const SearchPage = async (props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    brand?: string;
    stock?: string;
    price?: string;
    rating?: string;
    sort?: string;
    page?: string;
    vectorSearch?: string;
  }>;
}) => {
  const {
    q = "all",
    category = "all",
    brand = "all",
    stock = "all",
    price = "all",
    rating = "all",
    sort = "newest",
    page = "1",
    vectorSearch = "true",
  } = await props.searchParams;

  const currentPage = Number(page);
  const useVectorSearch = vectorSearch === "true";

  // Construct filter url
  const getFilterUrl = ({
    c,
    b,
    st,
    p,
    s,
    r,
    pg,
    vs,
  }: {
    c?: string;
    b?: string;
    st?: string;
    p?: string;
    s?: string;
    r?: string;
    pg?: string;
    vs?: string;
  }) => {
    const params = {
      q,
      category,
      brand,
      stock,
      price,
      rating,
      sort,
      page,
      vectorSearch,
    };

    if (c !== undefined) params.category = c;
    if (b !== undefined) params.brand = b;
    if (st !== undefined) params.stock = st;
    if (p !== undefined) params.price = p;
    if (s !== undefined) params.sort = s;
    if (r !== undefined) params.rating = r;
    if (pg !== undefined) params.page = pg;
    if (vs !== undefined) params.vectorSearch = vs;

    return `/search?${new URLSearchParams(params).toString()}`;
  };

  const products = (await getAllProducts({
    query: q,
    category,
    brand,
    stock,
    price,
    rating,
    sort,
    page: currentPage,
    useVectorSearch,
  })) as {
    data: ProductWithId[];
    totalPages: number;
    isVectorSearch?: boolean;
    [key: string]: any;
  };

  const [{ data: categories = [] }, brands] = await Promise.all([
    getAllMainCategories() as Promise<{ data: MainCategory[] }>,
    getProductBrands(),
  ]);

  const filterSections: FilterSection[] = [
    {
      title: "Department",
      options: [
        {
          label: "Any",
          href: getFilterUrl({ c: "all", pg: "1" }),
          active: category === "all" || category === "",
        },
        ...categories.map((item) => ({
          label: item.name,
          href: getFilterUrl({ c: item.name, pg: "1" }),
          active: category === item.name,
        })),
      ],
    },
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

  return (
    <FilterSidebar sidebar={<CategoryFilter sections={filterSections} />}>
      <div className="space-y-4">
        <VectorSearchToggle />

        <div className="flex-between my-4 flex-col gap-4 md:flex-row">
          {/* Filtered row */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {q !== "all" && q !== "" && (
              <span className="flex items-center gap-2">
                Query: {q}
                {products.isVectorSearch && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    AI Enhanced
                  </span>
                )}
              </span>
            )}
            {category !== "all" && category !== "" && (
              <span>Category: {category}</span>
            )}
            {brand !== "all" && brand !== "" && <span>Brand: {brand}</span>}
            {stock !== "all" && <span>Availability: {stock}</span>}
            {price !== "all" && <span>Price: {price}</span>}
            {rating !== "all" && <span>Rating: {rating} stars & up</span>}
            {(q !== "all" && q !== "") ||
            (category !== "all" && category !== "") ||
            (brand !== "all" && brand !== "") ||
            stock !== "all" ||
            rating !== "all" ||
            price !== "all" ? (
              <Button variant={"link"} asChild>
                <Link href="/search">Clear</Link>
              </Button>
            ) : null}
          </div>

          {/* Sorting */}
          <div>
            Sort by{" "}
            {sortOrders.map((s) => (
              <Link
                key={s}
                className={`mx-2 ${sort == s && "font-bold"}`}
                href={getFilterUrl({ s, pg: "1" })}>
                {s}
              </Link>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {products.data.length === 0
              ? "No products found"
              : `Showing page ${currentPage} of ${products.totalPages} (${products.data.length} products)`}
            {products.isVectorSearch && (
              <span className="ml-2 text-blue-600">• AI search results</span>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {products.data.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-lg text-muted-foreground">No products found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or{" "}
                {!useVectorSearch ? "enable AI search" : "disable AI search"}
              </p>
            </div>
          )}
          {products.data.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showVectorScore={products.isVectorSearch} // Pass this prop if you want to show relevance
            />
          ))}
        </div>

        {/* Pagination */}
        <PaginationComponent
          currentPage={Number(page)}
          totalPages={products.totalPages}
          baseUrl="/search"
          searchParams={{
            q,
            category,
            brand,
            stock,
            price,
            rating,
            sort,
            vectorSearch, // Include this
          }}
        />
      </div>
    </FilterSidebar>
  );
};

export default SearchPage;
