import DeleteDialog from "@/components/shared/DeteleDialog";
import Pagination from "@/components/shared/Pagination";
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
import {
  deleteMainCategory,
  getAllSubCategories,
} from "@/lib/actions/category.actions";
import { requireAdmin } from "@/lib/auth-guard";
import { UpdateSubCategory } from "@/types";
import { BadgeDollarSign, Barcode, CreditCard, Users } from "lucide-react";
import Link from "next/link";

const AdminSubCategoriesPage = async (props: {
  searchParams: Promise<{
    page: string;
    query: string;
    category: string;
  }>;
}) => {
  await requireAdmin();

  const searchParams = await props.searchParams;

  const page = Number(searchParams.page) || 1;
  const searchText = searchParams.query || "";
  const category = searchParams.category || "";

  const categories = (await getAllSubCategories()) as {
    data: UpdateSubCategory[];
    totalPages: number;
  };

  console.log("Categories 💥:", categories);
  return (
    <div className="space-y-2">
      <div className="py-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <BadgeDollarSign />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* {formatCurrency(
                summary.totalSales._sum.totalPrice?.toString() || 0
              )} */}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <CreditCard />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* {formatNumber(summary.ordersCount)} */}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* {formatNumber(summary.usersCount)} */}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Barcode />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* {formatNumber(summary.productCounts)} */}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-between">
        <div className="flex items-center gap-3">
          <h1 className="h2-bold">Categories</h1>
          {searchText && (
            <div>
              Filtered by <i>&quot;{searchText}&quot;</i>{" "}
              <Link href="/admin/categories">
                <Button variant="outline" size="sm">
                  Remove Filter
                </Button>
              </Link>
            </div>
          )}
        </div>
        <Button asChild variant="default">
          <Link href="/admin/sub-categories/create">Create Category</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>NAME</TableHead>
            <TableHead>LIST OF SUB</TableHead>
            <TableHead className="w-[100px]">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.data?.map((category) => (
            <TableRow key={category.id}>
              <TableCell>...{category.id.split("-").pop()}</TableCell>
              <TableCell>{category.name}</TableCell>
              <TableCell>{category.name}</TableCell>
              <TableCell className="flex gap-1">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/sub-categories/${category.id}`}>
                    Edit
                  </Link>
                </Button>
                <DeleteDialog id={category.id} action={deleteMainCategory} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {(categories.totalPages ?? 0) > 1 && (
        <Pagination page={page} totalPages={categories.totalPages ?? 1} />
      )}
    </div>
  );
};

export default AdminSubCategoriesPage;
