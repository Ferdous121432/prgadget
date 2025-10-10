"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ControllerRenderProps, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import slugify from "slugify";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { jsxToasts } from "@/lib/customToaster";
import {
  createMainCategory,
  updateMainCategory,
} from "@/lib/actions/category.actions";
import { MainCategory } from "@/lib/generated/prisma";
import {
  createMainCategorySchema,
  updateMainCategorySchema,
} from "@/lib/validators";
import { mainCategoryDefaultValues } from "@/lib/constants";
import { CreateMainCategory } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { UploadButton } from "@/lib/uploadthing";
import { useState } from "react";
import { deleteImagesFromUploadThing } from "@/lib/hooks/uploadthing";

const CategoryForm = ({
  type,
  category,
  categoryId,
}: {
  type: "Create" | "Update";
  category?: MainCategory;
  categoryId?: string;
}) => {
  const router = useRouter();
  const [uploadedImageKeys, setUploadedImageKeys] = useState<string[]>([]);

  const form = useForm<MainCategory | CreateMainCategory>({
    resolver:
      type === "Update"
        ? (zodResolver(updateMainCategorySchema) as any)
        : (zodResolver(createMainCategorySchema) as any),
    defaultValues:
      category && type === "Update" ? category : mainCategoryDefaultValues,
  });

  const onSubmit: SubmitHandler<CreateMainCategory> = async (values) => {
    // On Create
    if (type === "Create") {
      const res = await createMainCategory(values);

      if (!res.success) {
        jsxToasts.errorWithIcon(
          "Failed to create category",
          res.message || "Something went wrong"
        );
        // Delete uploaded images from UploadThing
        await deleteImagesFromUploadThing(uploadedImageKeys);
      } else {
        jsxToasts.successWithIcon({
          title: "Category created successfully",
          message: res.message,
        });
        router.push("/admin/categories");
      }
    }

    // On Update
    if (type === "Update") {
      if (!categoryId) {
        router.push("/admin/categories");
        return;
      }

      const res = await updateMainCategory({ ...values, id: categoryId });

      if (!res.success) {
        jsxToasts.errorWithIcon(
          "Failed to update category",
          res.message || "Something went wrong"
        );
      } else {
        jsxToasts.successWithIcon({
          title: "Category updated successfully",
          message: res.message,
        });
        router.push("/admin/categories");
      }
    }
  };

  const image = form.watch("image");

  return (
    <Form {...form}>
      <form
        method="POST"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8">
        {/* NAME & SLUG */}
        <div className="flex flex-col md:flex-row gap-5">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof createMainCategorySchema>,
                "name"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Slug */}
          <FormField
            control={form.control}
            name="slug"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof createMainCategorySchema>,
                "slug"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <div className="relative  flex flex-row space-x-3 items-end ">
                    <Input placeholder="Enter slug" {...field} />
                    <Button
                      type="button"
                      className="bg-slate-800 hover:bg-gray-600 text-white px-4 py-1 mt-2"
                      onClick={() => {
                        form.setValue(
                          "slug",
                          slugify(form.getValues("name"), { lower: true })
                        );
                      }}>
                      Generate
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* IMAGE */}
        <div className="upload-field">
          <Card>
            <CardContent className="space-y-2 mt-2">
              {image && image.trim() !== "" && (
                <Image
                  src={image}
                  alt="banner image"
                  className="w-full h-auto object-cover object-center rounded-sm"
                  width={1200}
                  height={400}
                />
              )}

              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(
                  res: { ufsUrl: string; name: string; key: string }[]
                ) => {
                  if (res && res[0]?.ufsUrl) {
                    form.setValue("image", res[0].ufsUrl);
                    form.setValue("image_key", res[0].key);

                    // Track uploaded image key for deletion if needed
                    setUploadedImageKeys((prev) => [...prev, res[0].key]);

                    jsxToasts.successWithIcon({
                      title: "Image uploaded successfully!",
                      message: "",
                    });
                  }
                }}
                onUploadError={(error: Error) => {
                  jsxToasts.errorWithIcon(
                    "Failed to upload Image",
                    "Something went wrong"
                  );
                }}
              />
            </CardContent>
          </Card>
        </div>
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

export default CategoryForm;
