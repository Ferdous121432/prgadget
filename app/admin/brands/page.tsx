import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminBrandSummaries } from "@/lib/actions/brand.actions";
import { requireAdmin } from "@/lib/auth-guard";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/utils";
import { Boxes, PackageSearch, ShieldAlert, Tags } from "lucide-react";
import Link from "next/link";

type BrandSummary = {
  id: string;
  brand: string;
  productCount: number;
  totalStock: number;
  outOfStockCount: number;
  averagePrice: number;
  latestProductAt: Date | string | null;
  categoryNames: string[];
};

const AdminProductsPage = async (props: {
  searchParams: Promise<{
    page: string;
    query: string;
    category: string;
  }>;
}) => {
  await requireAdmin();

  const searchParams = await props.searchParams;

  const searchText = searchParams.query || "";

  const brandsResponse = await getAdminBrandSummaries();
  const brands = (brandsResponse.data ?? []) as BrandSummary[];

  const filteredBrands = brands.filter((item: BrandSummary) => {
    const normalizedQuery = searchText.trim().toLowerCase();

    if (!normalizedQuery) {
      return true;
    }

    return (
      item.brand.toLowerCase().includes(normalizedQuery) ||
      item.categoryNames.some((categoryName: string) =>
        categoryName.toLowerCase().includes(normalizedQuery),
      )
    );
  });

  const totalBrands = filteredBrands.length;
  const totalBrandProducts = filteredBrands.reduce(
    (total: number, brand: BrandSummary) => total + brand.productCount,
    0,
  );
  const totalBrandStock = filteredBrands.reduce(
    (total: number, brand: BrandSummary) => total + brand.totalStock,
    0,
  );
  const brandsWithStockRisk = filteredBrands.filter(
    (brand: BrandSummary) => brand.outOfStockCount > 0 || brand.totalStock <= 5,
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="h2-bold">Brands</h1>
            <p className="text-sm text-muted-foreground">
              Manage standalone brands and review their product coverage across
              the catalog.
            </p>
          </div>
          {searchText && (
            <div className="flex items-center gap-2">
              Filtered by <i>&quot;{searchText}&quot;</i>{" "}
              <Link href="/admin/brands">
                <Button variant="outline" size="sm">
                  Remove Filter
                </Button>
              </Link>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/products">View Products</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/products/create">Create Product</Link>
          </Button>
          <Button asChild variant="default">
            <Link href="/admin/brands/create">Create Brand</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active brands</CardTitle>
            <Tags className="size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(totalBrands)}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Unique product brands currently represented in catalog data.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Branded products
            </CardTitle>
            <Boxes className="size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(totalBrandProducts)}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Products assigned to a non-empty brand name.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total brand stock
            </CardTitle>
            <PackageSearch className="size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(totalBrandStock)}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Combined inventory across all branded SKUs.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Stock-risk brands
            </CardTitle>
            <ShieldAlert className="size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(brandsWithStockRisk)}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Brands with out-of-stock products or critically low total stock.
            </p>
          </CardContent>
        </Card>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>BRAND</TableHead>
            <TableHead>PRODUCTS</TableHead>
            <TableHead>STOCK</TableHead>
            <TableHead>AVG PRICE</TableHead>
            <TableHead>TOP CATEGORIES</TableHead>
            <TableHead>LAST ADDED</TableHead>
            <TableHead className="w-40">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBrands.length > 0 ? (
            filteredBrands.map((brand: BrandSummary) => (
              <TableRow key={brand.id}>
                <TableCell className="font-medium">{brand.brand}</TableCell>
                <TableCell>{formatNumber(brand.productCount)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{formatNumber(brand.totalStock)}</span>
                    {brand.outOfStockCount > 0 && (
                      <Badge variant="destructive">
                        {brand.outOfStockCount} out
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(brand.averagePrice)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {brand.categoryNames.length > 0 ? (
                      brand.categoryNames.map((categoryName: string) => (
                        <Badge key={categoryName} variant="outline">
                          {categoryName}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No products yet
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {brand.latestProductAt
                    ? formatDateTime(new Date(brand.latestProductAt)).dateOnly
                    : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/brands/${brand.id}`}>Edit</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/admin/products?query=${encodeURIComponent(brand.brand)}`}>
                        Products
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/search?query=${encodeURIComponent(brand.brand)}`}>
                        Storefront
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-8 text-center text-sm text-muted-foreground">
                No brands matched the current filter.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminProductsPage;
