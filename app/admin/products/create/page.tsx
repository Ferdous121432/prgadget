import { Metadata } from "next";
import ProductForm from "@/components/admin/product-form";
import { getCategoriesForProductForm } from "@/lib/actions/category.actions";
export const metadata: Metadata = {
  title: "Create Product",
};

const CreateProductPage = async () => {
  const { mainCategories, subCategories, subSubCategories } =
    await getCategoriesForProductForm();

  // console.log("mainCategories:", mainCategories);
  // console.log("subCategories:", subCategories);
  // console.log("subSubCategories:", subSubCategories);

  return (
    <>
      <h2 className="h2-bold">Create Product</h2>
      <div className="my-8">
        <ProductForm
          type="Create"
          mainCategories={mainCategories}
          subCategories={subCategories}
          subSubCategories={subSubCategories}
        />
      </div>
    </>
  );
};

export default CreateProductPage;
