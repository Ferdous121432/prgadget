import { Metadata } from "next";
import { notFound } from "next/navigation";
import { UpdateSubCategory } from "@/types";
import CategoryForm from "../create/Category-form";
import {
  getAllSubCategories,
  getSubSubCategoryById,
} from "@/lib/actions/category.actions";

export const metadata: Metadata = {
  title: "Update Sub-Category",
};

const AdminSubSubCategoryUpdatePage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const { id } = await props.params;
  const subSubCategory = (await getSubSubCategoryById(id)) as any;

  const { data } = (await getAllSubCategories()) as {
    data: UpdateSubCategory[];
    totalPages: number;
  };

  const subCategories = data.map(({ id, name }) => ({ id, name }));

  if (!subSubCategory) return notFound();

  return (
    <div className="space-y-8 md:my-10 max-w-5xl mx-auto">
      <h1 className="h2-bold">Update Sub-Category</h1>

      <CategoryForm
        type="Update"
        subCategory={subSubCategory}
        categoryId={subSubCategory.id}
        categories={subCategories}
      />
    </div>
  );
};

export default AdminSubSubCategoryUpdatePage;
