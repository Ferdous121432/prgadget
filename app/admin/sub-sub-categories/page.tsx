import Link from "next/link";
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
import { UpdateSubSubCategory } from "@/types";
import {
  deleteSubSubCategory,
  getAllSubSubCategories,
} from "@/lib/actions/category.actions";

const AdminSubSubCategoriesPage = async (props: {
  searchParams: Promise<{
    page: string;
    query: string;
    category: string;
  }>;
}) => {
  await requireAdmin();

  const searchParams = await props.searchParams;

  const page = Number(searchParams.page) || 1;

  const categories = await getAllSubSubCategories();
  const rows = categories.success
    ? (categories.data as Array<
        UpdateSubSubCategory & { subCategory?: { name?: string | null } | null }
      >)
    : [];
  const totalPages = categories.success ? categories.totalPages : 0;

  return (
    <div className="space-y-2">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <h1 className="h2-bold">Sub-Sub Categories</h1>
        </div>
        <Button asChild variant="default">
          <Link href="/admin/sub-sub-categories/create">
            Create Sub-Sub Category
          </Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>NAME</TableHead>
            <TableHead>SUB CAT</TableHead>
            <TableHead className="w-25">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((category) => (
              <TableRow key={category.id}>
                <TableCell>...{category.id.split("-").pop()}</TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.subCategory?.name ?? "-"}</TableCell>
                <TableCell className="flex gap-1">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/sub-sub-categories/${category.id}`}>
                      Edit
                    </Link>
                  </Button>
                  <DeleteDialog
                    id={category.id}
                    action={deleteSubSubCategory}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground">
                No sub-sub categories found.
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

export default AdminSubSubCategoriesPage;
