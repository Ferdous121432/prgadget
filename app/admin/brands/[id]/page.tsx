import { getBrandById } from "@/lib/actions/brand.actions";
import { requireAdmin } from "@/lib/auth-guard";
import { Brand } from "@/lib/generated/prisma";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import BrandForm from "../create/Brand-form";

export const metadata: Metadata = {
  title: "Update Brand",
};

const AdminBrandUpdatePage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  await requireAdmin();

  const { id } = await props.params;

  const brand = (await getBrandById(id)) as Brand | null;

  if (!brand) return notFound();

  return (
    <div className="space-y-8 md:my-10 max-w-5xl mx-auto">
      <h1 className="h2-bold">Update Brand</h1>

      <BrandForm type="Update" brand={brand} brandId={brand.id} />
    </div>
  );
};

export default AdminBrandUpdatePage;
