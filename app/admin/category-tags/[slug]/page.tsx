import { getCategoryTagBySlug } from "@/lib/actions/category-tag.actions";
import { requireAdmin } from "@/lib/auth-guard";
import { CategoryTag } from "@/lib/generated/prisma";
import { Metadata } from "next";
import CategoryForm from "../create/Category-form";

export const metadata: Metadata = {
  title: "Update Sub-Category",
};

const AdminCategoryTagUpdatePage = async (props: {
  params: Promise<{
    slug: string;
  }>;
}) => {
  await requireAdmin();

  const { slug } = await props.params;

  console.log("slug param:", slug);

  const categoryTag = (await getCategoryTagBySlug(slug)) as CategoryTag;
  console.log("Fetched category data:", categoryTag);

  // if (!category) return notFound();
  // console.log("Data:", category);

  return (
    <div className="space-y-8 md:my-10 max-w-5xl mx-auto">
      <h1 className="h2-bold">Update Category Tag</h1>

      <CategoryForm
        type="Update"
        category={categoryTag}
        categoryId={categoryTag.slug}
      />
    </div>
  );
};

export default AdminCategoryTagUpdatePage;
