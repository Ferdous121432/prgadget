import { getAllMainCategories } from "@/lib/actions/category.actions";
import { UpdateMainCategory } from "@/types";
import { Metadata } from "next";
import CategoryForm from "./Category-form";
export const metadata: Metadata = {
  title: "Create Category",
};

const CreateSubCategoryPage = async () => {
  const { data } = (await getAllMainCategories()) as {
    data: UpdateMainCategory[];
    totalPages: number;
  };

  const categories = data.map(({ id, name }) => ({ id, name }));

  // console.log("Categories 💥:", categories);

  return (
    <>
      <h2 className="h2-bold">Create Category</h2>
      <div className="my-8">
        <CategoryForm type="Create" categories={categories} />
      </div>
    </>
  );
};

export default CreateSubCategoryPage;
