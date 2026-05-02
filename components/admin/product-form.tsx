"use client";
import Category from "@/components/admin/product-form/Category";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import { productDefaultValues } from "@/lib/constants";
import { jsxToasts } from "@/lib/customToaster";
import { deleteImagesFromUploadThing } from "@/lib/hooks/uploadthing";
import { omitEmptyFields } from "@/lib/hooks/util-functions";
import { productSpecificationSections } from "@/lib/product-specifications";
import { insertProductSchema, updateProductSchema } from "@/lib/validators";
import { ProductSchema, ProductSpecifications, ProductWithId } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import Description from "./product-form/Description";
import Details from "./product-form/Details";
import Images from "./product-form/Images";
import Specifications from "./product-form/Specifications";

const ProductForm = ({
  type,
  product,
  productId,
  mainCategories,
  subCategories,
  subSubCategories,
  brandOptions,
  categoryTags,
}: {
  type: "Create" | "Update";
  product?: ProductSchema & { brand?: string; brandId?: string | null };
  productId?: string;
  mainCategories?: { id: string; name: string }[];
  subCategories?: { id: string; name: string; mainCategoryId: string }[];
  subSubCategories?: { id: string; name: string; subCategoryId: string }[];
  brandOptions?: { id: string; name: string }[];
  categoryTags?: { id: string; slug: string; name: string }[];
}) => {
  const router = useRouter();

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedImageKeys, setUploadedImageKeys] = useState<string[]>([]);

  // Extract category tags from the junction table structure
  const existingCategoryTags =
    product && type === "Update" && product.categoryTags
      ? (product.categoryTags as any[]).map((item: any) =>
          item.categoryTag ? item.categoryTag : item,
        )
      : [];

  const getSpecificationDefaults = (): ProductSpecifications => {
    if (productDefaultValues.specifications) {
      return productDefaultValues.specifications as ProductSpecifications;
    }

    return Object.fromEntries(
      productSpecificationSections.map((section) => [
        section.key,
        Object.fromEntries(section.fields.map((field) => [field.key, ""])),
      ]),
    ) as ProductSpecifications;
  };

  const mergeSpecificationDefaults = (
    specifications: unknown,
  ): ProductSpecifications => {
    const defaults = getSpecificationDefaults();

    if (
      !specifications ||
      typeof specifications !== "object" ||
      Array.isArray(specifications)
    ) {
      return defaults;
    }

    const source = specifications as Record<string, unknown>;

    return Object.fromEntries(
      Object.entries(defaults).map(([sectionKey, sectionDefaults]) => {
        const sourceSection = source[sectionKey];

        if (
          !sourceSection ||
          typeof sourceSection !== "object" ||
          Array.isArray(sourceSection)
        ) {
          return [sectionKey, sectionDefaults];
        }

        const sourceFields = sourceSection as Record<string, unknown>;

        return [
          sectionKey,
          Object.fromEntries(
            Object.entries(sectionDefaults).map(([fieldKey, defaultValue]) => [
              fieldKey,
              typeof sourceFields[fieldKey] === "string"
                ? sourceFields[fieldKey]
                : defaultValue,
            ]),
          ),
        ];
      }),
    ) as ProductSpecifications;
  };

  // Transform product's categoryTags to array of IDs for form defaultValues
  const getDefaultValues = () => {
    if (product && type === "Update") {
      const categoryTagIds = existingCategoryTags.map((tag: any) => tag.id);
      const matchedBrandId =
        product.brandId ||
        brandOptions?.find((option) => option.name === product.brand)?.id ||
        "";

      return {
        ...productDefaultValues,
        ...product,
        subCategoryId: product.subCategoryId ?? "",
        subSubCategoryId: product.subSubCategoryId ?? "",
        specifications: mergeSpecificationDefaults(product.specifications),
        brandId: matchedBrandId,
        categoryTags: categoryTagIds,
      };
    }
    return productDefaultValues;
  };

  const form = useForm<ProductSchema | ProductWithId>({
    resolver:
      type === "Update"
        ? zodResolver(updateProductSchema as any)
        : zodResolver(insertProductSchema as any),
    defaultValues: getDefaultValues() as any,
  });

  const onSubmit: SubmitHandler<ProductSchema | ProductWithId> = async (
    values,
  ) => {
    const filteredValues = omitEmptyFields(values) as ProductSchema;

    // On Create
    if (type === "Create") {
      const res = await createProduct(filteredValues as ProductSchema);
      if (!res.success) {
        jsxToasts.errorWithIcon(
          "Failed to create product",
          res.message || "Something went wrong",
        );
        // Delete uploaded images from UploadThing
        await deleteImagesFromUploadThing(uploadedImageKeys);
      } else {
        jsxToasts.successWithIcon({
          title: "Product created successfully!",
          message: res.message,
        });
        router.push("/admin/products");
      }
    }

    // On Update
    if (type === "Update") {
      if (!productId) {
        router.push("/admin/products");
        return;
      }

      const res = await updateProduct({ ...values, id: productId });

      if (!res.success) {
        jsxToasts.errorWithIcon(
          "Failed to update product",
          res.message || "Something went wrong",
        );
        // Delete uploaded images from UploadThing
        await deleteImagesFromUploadThing(uploadedImageKeys);
      } else {
        jsxToasts.successWithIcon({
          title: "Product updated successfully!",
          message: res.message,
        });
        router.push("/admin/products");
      }
    }
  };

  const images = form.watch("images");
  const isFeatured = form.watch("isFeatured");
  const banner = form.watch("banner");

  return (
    <Form {...form}>
      <form
        method="POST"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="gap-5 flex-row flex ">
            <TabsTrigger className="w-full px-6" value="details">
              Details
            </TabsTrigger>
            <TabsTrigger className="w-full px-6" value="description">
              Description
            </TabsTrigger>
            <TabsTrigger className="w-full px-6" value="specifications">
              Specifications
            </TabsTrigger>
            <TabsTrigger className="w-full px-6" value="images">
              Images
            </TabsTrigger>
            <TabsTrigger className="w-full px-6" value="category">
              Category & Brand
            </TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <Details />
          </TabsContent>
          <TabsContent value="description">
            <Description />
          </TabsContent>
          <TabsContent value="specifications">
            <Specifications />
          </TabsContent>
          <TabsContent value="images">
            <Images
              uploadProgress={uploadProgress}
              setUploadProgress={setUploadProgress}
              uploadedImageKeys={uploadedImageKeys}
              setUploadedImageKeys={setUploadedImageKeys}
            />
          </TabsContent>
          <TabsContent value="category">
            <Category
              mainCategories={mainCategories}
              subCategories={subCategories}
              subSubCategories={subSubCategories}
              brandOptions={brandOptions}
              categoryTags={categoryTags}
              existingCategoryTags={existingCategoryTags}
            />
          </TabsContent>
        </Tabs>

        <div>
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="button col-span-2 button-primary w-full">
            {form.formState.isSubmitting ? "Submitting" : `${type} Product`}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
