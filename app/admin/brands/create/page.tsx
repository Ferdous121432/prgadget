import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guard";
import CategoryForm from "./Category-form";
export const metadata: Metadata = {
  title: "Create Category",
};

const CreateCategoryPage = async () => {
  await requireAdmin();
  return (
    <>
      <h2 className="h2-bold">Create Category</h2>
      <div className="my-8">
        <CategoryForm type="Create" />
      </div>
    </>
  );
};

export default CreateCategoryPage;
