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
import { UpdateMainCategory } from "@/types";
import {
  deleteMainCategory,
  getAllMainCategories,
} from "@/lib/actions/category.actions";
import Image from "next/image";

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

  const categories = (await getAllMainCategories()) as {
    data: UpdateMainCategory[];
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
          <Link href="/admin/categories/create">Create Category</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>NAME</TableHead>
            <TableHead>LIST OF SUB</TableHead>
            <TableHead>IMAGE</TableHead>
            <TableHead className="w-[100px]">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.data?.map((category) => (
            <TableRow key={category.id}>
              <TableCell>...{category.id.split("-").pop()}</TableCell>
              <TableCell>{category.name}</TableCell>
              <TableCell>{category.name}</TableCell>
              <TableCell>
                {category.image && (
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={30}
                    height={30}
                  />
                )}
              </TableCell>
              <TableCell className="flex gap-1">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/categories/${category.id}`}>Edit</Link>
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

export default AdminProductsPage;
