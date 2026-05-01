import ProductForm from "@/components/admin/product-form";
import { getAllBrands } from "@/lib/actions/brand.actions";
import { getCategoryTagsForSelect } from "@/lib/actions/category-tag.actions";
import { getCategoriesForProductForm } from "@/lib/actions/category.actions";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Create Product",
};

const CreateProductPage = async () => {
  const [
    { mainCategories, subCategories, subSubCategories },
    categoryTags,
    brandsResponse,
  ] = await Promise.all([
    getCategoriesForProductForm(),
    getCategoryTagsForSelect(),
    getAllBrands(),
  ]);

  const brandOptions = brandsResponse.data ?? [];

  // console.log("categoryTags 💥💥💥", categoryTags);

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
          brandOptions={brandOptions}
          categoryTags={categoryTags}
        />
      </div>
    </>
  );
};

export default CreateProductPage;
