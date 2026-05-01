import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth-guard";
import { Metadata } from "next";
import Link from "next/link";
import BrandForm from "./Brand-form";

export const metadata: Metadata = {
  title: "Create Brand",
};

const CreateBrandPage = async () => {
  await requireAdmin();
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h2 className="h2-bold">Create Brand</h2>
        <Button asChild variant="outline">
          <Link href="/admin/brands">Back to Brands</Link>
        </Button>
      </div>
      <div className="my-8">
        <BrandForm type="Create" />
      </div>
    </>
  );
};

export default CreateBrandPage;
