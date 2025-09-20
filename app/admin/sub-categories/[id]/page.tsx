import { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { UpdateMainCategory } from "@/types";
import CategoryForm from "../create/Category-form";
import {
  getAllMainCategories,
  getSubCategoryById,
} from "@/lib/actions/category.actions";

export const metadata: Metadata = {
  title: "Update Sub-Category",
};

const AdminSubCategoryUpdatePage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  await requireAdmin();

  const { id } = await props.params;

  const { data } = (await getAllMainCategories()) as {
    data: UpdateMainCategory[];
    totalPages: number;
  };

  const categories = data.map(({ id, name }) => ({ id, name }));

  const subCategory = (await getSubCategoryById(id)) as any;

  if (!subCategory) return notFound();

  return (
    <div className="space-y-8 md:my-10 max-w-5xl mx-auto">
      <h1 className="h2-bold">Update Sub-Category</h1>

      <CategoryForm
        type="Update"
        subCategory={subCategory}
        categoryId={subCategory.id}
        categories={categories}
      />
    </div>
  );
};

export default AdminSubCategoryUpdatePage;
