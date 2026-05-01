import ProductForm from "@/components/admin/product-form";
import { getAllBrands } from "@/lib/actions/brand.actions";
import { getCategoryTagsForSelect } from "@/lib/actions/category-tag.actions";
import { getCategoriesForProductForm } from "@/lib/actions/category.actions";
import { getProductByIdNoCache } from "@/lib/actions/product.actions";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Update Product",
};

const AdminProductUpdatePage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const { id } = await props.params;

  const product = (await getProductByIdNoCache(id)) as any;

  if (!product) return notFound();

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
        brandOptions={brandOptions}
        categoryTags={categoryTags as any[]}
      />
    </div>
  );
};

export default AdminProductUpdatePage;
