import DeleteDialog from "@/components/shared/DeteleDialog";
import Pagination from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteSubCategory,
  getAllSubCategories,
} from "@/lib/actions/category.actions";
import { requireAdmin } from "@/lib/auth-guard";
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

  const categories = await getAllSubCategories();
  const rows = categories.success ? categories.data : [];
  const totalPages = categories.success ? categories.totalPages : 0;

  return (
    <div className="space-y-2">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <h1 className="h2-bold">Sub Categories</h1>
        </div>
        <Button asChild variant="default">
          <Link href="/admin/sub-categories/create">Create Sub Category</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>NAME</TableHead>
            <TableHead>MAIN CAT</TableHead>
            <TableHead>S-S CAT</TableHead>
            <TableHead className="w-25">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows?.length ? (
            rows.map((category) => (
              <TableRow key={category.id}>
                <TableCell>...{category.id.split("-").pop()}</TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.mainCategory?.name ?? "-"}</TableCell>
                <TableCell>{category.subsubcategories?.length ?? 0}</TableCell>
                <TableCell className="flex gap-1">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/sub-categories/${category.id}`}>
                      Edit
                    </Link>
                  </Button>
                  <DeleteDialog id={category.id} action={deleteSubCategory} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground">
                No sub categories found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {(totalPages ?? 0) > 1 && (
        <Pagination page={page} totalPages={totalPages ?? 1} />
      )}
    </div>
  );
};

export default AdminSubCategoriesPage;
