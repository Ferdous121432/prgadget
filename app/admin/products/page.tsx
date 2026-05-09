// app/admin/products/page.tsx
import VectorSearchToggle from "@/components/admin/vector-search-toggle";
import VectorSyncButton from "@/components/admin/vector-sync-button";
import Pagination from "@/components/shared/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllMainCategories } from "@/lib/actions/category.actions";
import {
  deleteProduct,
  duplicateProduct,
  getAllProducts,
  getProductBrands,
} from "@/lib/actions/product.actions";
import { requireAdmin } from "@/lib/auth-guard";
import { MainCategory } from "@/lib/generated/prisma";
import { ProductWithIds } from "@/types";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import ProductTableRow from "./ProductTableRow";

const PRODUCT_SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "stock-asc", label: "Stock: low to high" },
  { value: "stock-desc", label: "Stock: high to low" },
  { value: "rating-desc", label: "Rating: high to low" },
  { value: "rating-asc", label: "Rating: low to high" },
] as const;

type ProductSortValue = (typeof PRODUCT_SORT_OPTIONS)[number]["value"];

const STOCK_FILTER_OPTIONS = [
  { value: "", label: "All stock states" },
  { value: "in-stock", label: "In stock" },
  { value: "out-of-stock", label: "Out of stock" },
] as const;

const PRODUCT_SORT_FIELDS = {
  name: {
    asc: "name-asc",
    desc: "name-desc",
  },
  price: {
    asc: "price-asc",
    desc: "price-desc",
  },
  stock: {
    asc: "stock-asc",
    desc: "stock-desc",
  },
  rating: {
    asc: "rating-asc",
    desc: "rating-desc",
  },
} as const;

type ProductSortableField = keyof typeof PRODUCT_SORT_FIELDS;

function normalizeProductSort(value?: string): ProductSortValue {
  return PRODUCT_SORT_OPTIONS.some((option) => option.value === value)
    ? (value as ProductSortValue)
    : "newest";
}

function getSortIndicator(sort: ProductSortValue, field: ProductSortableField) {
  const fieldConfig = PRODUCT_SORT_FIELDS[field];

  if (sort === fieldConfig.asc) {
    return <ArrowUp className="size-4" />;
  }

  if (sort === fieldConfig.desc) {
    return <ArrowDown className="size-4" />;
  }

  return <ArrowUpDown className="size-4" />;
}

function getNextSortValue(
  sort: ProductSortValue,
  field: ProductSortableField,
): ProductSortValue {
  const fieldConfig = PRODUCT_SORT_FIELDS[field];

  if (sort === fieldConfig.asc) {
    return fieldConfig.desc;
  }

  if (sort === fieldConfig.desc) {
    return fieldConfig.asc;
  }

  return field === "rating" ? fieldConfig.desc : fieldConfig.asc;
}

function SortableHeader({
  label,
  field,
  sort,
  query,
  category,
  brand,
  stock,
  vectorSearch,
}: {
  label: string;
  field: ProductSortableField;
  sort: ProductSortValue;
  query?: string;
  category?: string;
  brand?: string;
  stock?: string;
  vectorSearch?: boolean;
}) {
  const nextSort = getNextSortValue(sort, field);

  return (
    <Button asChild variant="ghost" size="sm" className="-ml-3 h-8 px-3">
      <Link
        href={buildAdminProductsHref({
          query,
          category,
          brand,
          stock,
          sort: nextSort,
          vectorSearch,
        })}
        className="inline-flex items-center gap-1.5">
        <span>{label}</span>
        {getSortIndicator(sort, field)}
      </Link>
    </Button>
  );
}

function buildAdminProductsHref({
  query,
  category,
  brand,
  stock,
  sort,
  vectorSearch,
}: {
  query?: string;
  category?: string;
  brand?: string;
  stock?: string;
  sort?: string;
  vectorSearch?: boolean;
}) {
  const params = new URLSearchParams();

  if (query) {
    params.set("query", query);
  }

  if (category) {
    params.set("category", category);
  }

  if (brand) {
    params.set("brand", brand);
  }

  if (stock) {
    params.set("stock", stock);
  }

  if (sort && sort !== "newest") {
    params.set("sort", sort);
  }

  if (vectorSearch) {
    params.set("vectorSearch", "true");
  }

  const search = params.toString();
  return search ? `/admin/products?${search}` : "/admin/products";
}

const AdminProductsPage = async (props: {
  searchParams: Promise<{
    page?: string;
    query?: string;
    category?: string;
    brand?: string;
    stock?: string;
    sort?: string;
    vectorSearch?: string;
  }>;
}) => {
  await requireAdmin();

  const searchParams = await props.searchParams;

  const page = Number(searchParams.page) || 1;
  const searchText = searchParams.query || "";
  const category = searchParams.category || "";
  const brand = searchParams.brand || "";
  const stock = searchParams.stock || "";
  const sort = normalizeProductSort(searchParams.sort);
  const useVectorSearch = searchParams.vectorSearch === "true";

  const [products, categoryOptionsRaw, brandOptions] = await Promise.all([
    getAllProducts({
      query: searchText,
      page,
      category,
      brand,
      stock,
      sort,
      useVectorSearch,
    }) as Promise<{ data: ProductWithIds[]; totalPages: number }>,
    getAllMainCategories() as Promise<{ data: MainCategory[] }>,
    getProductBrands(),
  ]);

  const categoryOptions = categoryOptionsRaw?.data ?? [];
  const hasFilters = Boolean(
    searchText || category || brand || stock || sort !== "newest",
  );

  return (
    <div className="space-y-4">
      <div className="flex-between flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="h2-bold">Products</h1>
          <p className="text-sm text-muted-foreground">
            Filter by saved category and brand data, then sort the admin catalog
            directly from the database-backed product query.
          </p>
        </div>

        <div className="flex gap-2">
          <VectorSyncButton />
          <VectorSearchToggle currentState={useVectorSearch} />
          <Button asChild variant="default">
            <Link href="/admin/products/create">Create Product</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-dashed p-4">
        <form
          action="/admin/products"
          method="GET"
          className="grid gap-2 md:grid-cols-[minmax(0,1.4fr)_180px_180px_180px_180px_auto]">
          <Input
            type="search"
            name="query"
            defaultValue={searchText}
            placeholder="Search by name, description, or brand"
          />
          <select
            name="category"
            defaultValue={category}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
            <option value="">All categories</option>
            {categoryOptions.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
          <select
            name="brand"
            defaultValue={brand}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
            <option value="">All brands</option>
            {brandOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            name="stock"
            defaultValue={stock}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
            {STOCK_FILTER_OPTIONS.map((option) => (
              <option key={option.value || "all-stock"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            name="sort"
            defaultValue={sort}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
            {PRODUCT_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {useVectorSearch && (
            <input type="hidden" name="vectorSearch" value="true" />
          )}
          <Button type="submit">Apply</Button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {searchText && <Badge variant="outline">Query: {searchText}</Badge>}
          {category && <Badge variant="outline">Category: {category}</Badge>}
          {brand && <Badge variant="outline">Brand: {brand}</Badge>}
          {stock && <Badge variant="outline">Stock: {stock}</Badge>}
          <Badge variant="outline">
            Sort:{" "}
            {PRODUCT_SORT_OPTIONS.find((option) => option.value === sort)
              ?.label ?? "Newest first"}
          </Badge>
          {useVectorSearch && <Badge variant="outline">AI Search</Badge>}
          <Badge variant="outline">
            {products.data.length} rows on this page
          </Badge>
          <Badge variant="outline">{products.totalPages} pages</Badge>
          {hasFilters && (
            <Button asChild variant="outline" size="sm">
              <Link
                href={buildAdminProductsHref({
                  vectorSearch: useVectorSearch,
                })}>
                Clear filters
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>
              <SortableHeader
                label="NAME"
                field="name"
                sort={sort}
                query={searchText}
                category={category}
                brand={brand}
                stock={stock}
                vectorSearch={useVectorSearch}
              />
            </TableHead>
            <TableHead className="text-center items-center">
              <SortableHeader
                label="PRICE"
                field="price"
                sort={sort}
                query={searchText}
                category={category}
                brand={brand}
                stock={stock}
                vectorSearch={useVectorSearch}
              />
            </TableHead>
            <TableHead className="text-center items-center">
              <SortableHeader
                label="STOCK"
                field="stock"
                sort={sort}
                query={searchText}
                category={category}
                brand={brand}
                stock={stock}
                vectorSearch={useVectorSearch}
              />
            </TableHead>
            <TableHead className="text-center">
              <SortableHeader
                label="RATING"
                field="rating"
                sort={sort}
                query={searchText}
                category={category}
                brand={brand}
                stock={stock}
                vectorSearch={useVectorSearch}
              />
            </TableHead>
            {useVectorSearch && <TableHead>RELEVANCE</TableHead>}
            <TableHead className="w-25">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.data?.map((product, index) => (
            <ProductTableRow
              key={product.id}
              product={product}
              index={index}
              useVectorSearch={useVectorSearch}
              duplicateAction={duplicateProduct}
              deleteAction={deleteProduct}
            />
          ))}
        </TableBody>
      </Table>

      {(products.totalPages ?? 0) > 1 && (
        <Pagination page={page} totalPages={products.totalPages ?? 1} />
      )}
    </div>
  );
};

export default AdminProductsPage;
