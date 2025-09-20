import { Metadata } from "next";
import CategoryForm from "./Category-form";
import { UpdateSubCategory } from "@/types";
import { getAllSubCategories } from "@/lib/actions/category.actions";
export const metadata: Metadata = {
  title: "Create Category",
};

const CreateCategoryPage = async () => {
  const { data } = (await getAllSubCategories()) as {
    data: UpdateSubCategory[];
    totalPages: number;
  };

  const subCategories = data.map(({ id, name }) => ({ id, name }));

  return (
    <>
      <h2 className="h2-bold">Create Category</h2>
      <div className="my-8">
        <CategoryForm type="Create" categories={subCategories} />
      </div>
    </>
  );
};

export default CreateCategoryPage;
