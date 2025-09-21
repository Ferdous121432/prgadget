import PaginationComponent from "@/components/shared/product/Pagination";
import ProductCard from "@/components/shared/product/product-card";
import { Button } from "@/components/ui/button";
import { getAllMainCategories } from "@/lib/actions/category.actions";
import { getAllProducts } from "@/lib/actions/product.actions";
import { MainCategory } from "@/lib/generated/prisma";
import { Categories, ProductWithId, UpdateMainCategory } from "@/types";
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

const sortOrders = ["newest", "lowest", "highest", "rating"];

export async function generateMetadata(props: {
  searchParams: Promise<{
    q: string;
    category: string;
    price: string;
    rating: string;
  }>;
}) {
  const {
    q = "all",
    category = "all",
    price = "all",
    rating = "all",
  } = await props.searchParams;

  const isQuerySet = q && q !== "all" && q.trim() !== "";
  const isCategorySet =
    category && category !== "all" && category.trim() !== "";
  const isPriceSet = price && price !== "all" && price.trim() !== "";
  const isRatingSet = rating && rating !== "all" && rating.trim() !== "";

  if (isQuerySet || isCategorySet || isPriceSet || isRatingSet) {
    return {
      title: `
      Search ${isQuerySet ? q : ""} 
      ${isCategorySet ? `: Category ${category}` : ""}
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
    price?: string;
    rating?: string;
    sort?: string;
    page?: string;
  }>;
}) => {
  const {
    q = "all",
    category = "all",
    price = "all",
    rating = "all",
    sort = "newest",
    page = "1",
  } = await props.searchParams;

  const currentPage = Number(page);

  // Construct filter url
  const getFilterUrl = ({
    c,
    p,
    s,
    r,
    pg,
  }: {
    c?: string;
    p?: string;
    s?: string;
    r?: string;
    pg?: string;
  }) => {
    const params = { q, category, price, rating, sort, page };

    if (c !== undefined) params.category = c;
    if (p !== undefined) params.price = p;
    if (s !== undefined) params.sort = s;
    if (r !== undefined) params.rating = r;
    if (pg !== undefined) params.page = pg;

    return `/search?${new URLSearchParams(params).toString()}`;
  };

  const products = (await getAllProducts({
    query: q,
    category,
    price,
    rating,
    sort,
    page: currentPage,
  })) as { data: ProductWithId[]; totalPages: number; [key: string]: any };

  const { data: categories } = (await getAllMainCategories()) as any;

  // Generate pagination range
  const generatePaginationRange = (current: number, total: number) => {
    const range: (number | string)[] = [];
    const showEllipsis = total > 7;

    if (!showEllipsis) {
      // Show all pages if total <= 7
      for (let i = 1; i <= total; i++) {
        range.push(i);
      }
    } else {
      // Always show first page
      range.push(1);

      if (current <= 4) {
        // Current page is near the beginning
        for (let i = 2; i <= 5; i++) {
          range.push(i);
        }
        range.push("...");
        range.push(total);
      } else if (current >= total - 3) {
        // Current page is near the end
        range.push("...");
        for (let i = total - 4; i <= total; i++) {
          range.push(i);
        }
      } else {
        // Current page is in the middle
        range.push("...");
        for (let i = current - 1; i <= current + 1; i++) {
          range.push(i);
        }
        range.push("...");
        range.push(total);
      }
    }

    return range;
  };

  const paginationRange = generatePaginationRange(
    currentPage,
    products.totalPages
  );

  return (
    <div className="grid md:grid-cols-5 md:gap-5">
      <div className="filter-links">
        {/* Category Links */}
        <div className="text-xl mb-2 mt-3">Department</div>
        <div>
          <ul className="space-y-1">
            <li>
              <Link
                className={`${
                  (category === "all" || category === "") && "font-bold"
                }`}
                href={getFilterUrl({ c: "all", pg: "1" })}>
                Any
              </Link>
            </li>
            {categories.map((x: MainCategory) => (
              <li key={x.id}>
                <Link
                  className={`${category === x.name && "font-bold"}`}
                  href={getFilterUrl({ c: x.name, pg: "1" })}>
                  {x.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Price Links */}
        <div className="text-xl mb-2 mt-8">Price</div>
        <div>
          <ul className="space-y-1">
            <li>
              <Link
                className={`${price === "all" && "font-bold"}`}
                href={getFilterUrl({ p: "all", pg: "1" })}>
                Any
              </Link>
            </li>
            {prices.map((p) => (
              <li key={p.value}>
                <Link
                  className={`${price === p.value && "font-bold"}`}
                  href={getFilterUrl({ p: p.value, pg: "1" })}>
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Rating Links */}
        <div className="text-xl mb-2 mt-8">Customer Ratings</div>
        <div>
          <ul className="space-y-1">
            <li>
              <Link
                className={`${rating === "all" && "font-bold"}`}
                href={getFilterUrl({ r: "all", pg: "1" })}>
                Any
              </Link>
            </li>
            {ratings.map((r) => (
              <li key={r}>
                <Link
                  className={`${rating === r.toString() && "font-bold"}`}
                  href={getFilterUrl({ r: `${r}`, pg: "1" })}>
                  {`${r} stars & up`}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="md:col-span-4 space-y-4">
        <div className="flex-between flex-col md:flex-row my-4">
          {/* Filtered row */}
          <div className="flex items-center">
            {q !== "all" && q !== "" && "Query: " + q}
            {category !== "all" && category !== "" && " Category: " + category}
            {price !== "all" && " Price: " + price}
            {rating !== "all" && " Rating: " + rating + " stars & up"}
            &nbsp;
            {(q !== "all" && q !== "") ||
            (category !== "all" && category !== "") ||
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
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {products.data.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-lg text-muted-foreground">No products found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters
              </p>
            </div>
          )}
          {products.data.map((product) => (
            <ProductCard key={product.id} product={product} />
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
            price,
            rating,
            sort,
          }}
        />
      </div>
    </div>
  );
};

export default SearchPage;
