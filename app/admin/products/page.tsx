// app/admin/products/page.tsx
import Link from "next/link";
import { formatCurrency, formatId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/shared/Pagination";
import DeleteDialog from "@/components/shared/DeteleDialog";
import { requireAdmin } from "@/lib/auth-guard";
import { deleteProduct, getAllProducts } from "@/lib/actions/product.actions";
import { Product, ProductWithIds } from "@/types";
import VectorSearchToggle from "@/components/admin/vector-search-toggle";
import VectorSyncButton from "@/components/admin/vector-sync-button";

const AdminProductsPage = async (props: {
  searchParams: Promise<{
    page: string;
    query: string;
    category: string;
    vectorSearch: string;
  }>;
}) => {
  await requireAdmin();

  const searchParams = await props.searchParams;

  const page = Number(searchParams.page) || 1;
  const searchText = searchParams.query || "";
  const category = searchParams.category || "";
  const useVectorSearch = searchParams.vectorSearch === "true";

  const products = (await getAllProducts({
    query: searchText,
    page,
    category,
    useVectorSearch, // Enable vector search
  })) as { data: ProductWithIds[]; totalPages: number };

  return (
    <div className="space-y-2">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <h1 className="h2-bold">Products</h1>
          {searchText && (
            <div className="flex items-center gap-2">
              <span>
                Filtered by <i>&quot;{searchText}&quot;</i>
                {useVectorSearch && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    AI Search
                  </span>
                )}
              </span>
              <Link href="/admin/products">
                <Button variant="outline" size="sm">
                  Remove Filter
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <VectorSyncButton />
          <VectorSearchToggle currentState={useVectorSearch} />
          <Button asChild variant="default">
            <Link href="/admin/products/create">Create Product</Link>
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>NAME</TableHead>
            <TableHead className="text-right">PRICE</TableHead>
            <TableHead>STOCK</TableHead>
            <TableHead>RATING</TableHead>
            {useVectorSearch && <TableHead>RELEVANCE</TableHead>}
            <TableHead className="w-[100px]">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.data?.map((product, index) => (
            <TableRow key={product.id}>
              <TableCell>{formatId(product.id)}</TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(product.price)}
              </TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>{product.rating}</TableCell>
              {useVectorSearch && (
                <TableCell>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      {(0.9 - index * 0.1).toFixed(2)}
                    </span>
                  </div>
                </TableCell>
              )}
              <TableCell className="flex gap-1">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/products/${product.id}`}>Edit</Link>
                </Button>
                <DeleteDialog id={product.id} action={deleteProduct} />
              </TableCell>
            </TableRow>
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
