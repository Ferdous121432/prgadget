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
  deleteCategoryTag,
  getAllCategoryTags,
} from "@/lib/actions/category-tag.actions";
import { requireAdmin } from "@/lib/auth-guard";
import { CreateCategoryTag } from "@/types";
import Link from "next/link";

const AdminProductsPage = async (props: {
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

  const categories = (await getAllCategoryTags()) as {
    data: CreateCategoryTag[];
    totalPages: number;
  };

  return (
    <div className="space-y-2">
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
          <Link href="/admin/category-tags/create">Create Category Tag</Link>
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
              <TableCell>
                {category.id ? `...${category.id.split("-").pop()}` : "null"}
              </TableCell>
              <TableCell>{category.name}</TableCell>
              <TableCell>{category.name}</TableCell>

              <TableCell className="flex gap-1">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/category-tags/${category.slug}`}>
                    Edit
                  </Link>
                </Button>
                <DeleteDialog id={category.slug} action={deleteCategoryTag} />
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

export default AdminProductsPage;
