import { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { UpdateMainCategory } from "@/types";
import CategoryForm from "../create/Category-form";
import {
  getAllMainCategories,
  getMainCategoryById,
  getSubCategoryById,
} from "@/lib/actions/category.actions";
import { MainCategory } from "@/lib/generated/prisma";

export const metadata: Metadata = {
  title: "Update Sub-Category",
};

const AdminCategoryUpdatePage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  await requireAdmin();

  const { id } = await props.params;

  console.log("id param:", id);

  const category = (await getMainCategoryById(id)) as MainCategory;
  console.log("Fetched category data:", category);

  // if (!category) return notFound();
  // console.log("Data:", category);

  return (
    <div className="space-y-8 md:my-10 max-w-5xl mx-auto">
      <h1 className="h2-bold">Update Sub-Category</h1>

      <CategoryForm
        type="Update"
        category={category}
        categoryId={category.id}
      />
    </div>
  );
};

export default AdminCategoryUpdatePage;
