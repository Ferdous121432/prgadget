import ProductForm from "@/components/admin/product-form";
import { getProductByIdNoCache } from "@/lib/actions/product.actions";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductWithId } from "@/types";
import { getCategoriesForProductForm } from "@/lib/actions/category.actions";

export const metadata: Metadata = {
  title: "Update Product",
};

const AdminProductUpdatePage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const { id } = await props.params;

  const product = (await getProductByIdNoCache(id)) as ProductWithId;
  console.log("product to update:", product);

  const { mainCategories, subCategories, subSubCategories } =
    await getCategoriesForProductForm();

  if (!product) return notFound();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <h1 className="h2-bold">Update Product</h1>

      <ProductForm
        type="Update"
        product={product}
        productId={product.id}
        mainCategories={mainCategories}
        subCategories={subCategories}
        subSubCategories={subSubCategories}
      />
    </div>
  );
};

export default AdminProductUpdatePage;
