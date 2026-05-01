"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createBrand, updateBrand } from "@/lib/actions/brand.actions";
import { jsxToasts } from "@/lib/customToaster";
import { Brand } from "@/lib/generated/prisma";
// import { deleteImagesFromUploadThing } from "@/lib/hooks/uploadthing";
import { UploadButton } from "@/lib/uploadthing";
import { createBrandSchema, updateBrandSchema } from "@/lib/validators";
import { CreateBrand } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ControllerRenderProps, SubmitHandler, useForm } from "react-hook-form";
import slugify from "slugify";
import { z } from "zod";

const brandDefaultValues = {
  name: "",
  slug: "",
  image: "",
  image_key: "",
};

const BrandForm = ({
  type,
  brand,
  brandId,
}: {
  type: "Create" | "Update";
  brand?: Brand;
  brandId?: string;
}) => {
  const router = useRouter();
  const [uploadedImageKeys, setUploadedImageKeys] = useState<string[]>([]);

  const form = useForm<Brand | CreateBrand>({
    resolver:
      type === "Update"
        ? (zodResolver(updateBrandSchema) as any)
        : (zodResolver(createBrandSchema) as any),
    defaultValues: brand && type === "Update" ? brand : brandDefaultValues,
  });

  const onSubmit: SubmitHandler<CreateBrand> = async (values) => {
    // On Create
    if (type === "Create") {
      const res = await createBrand(values);

      if (!res.success) {
        jsxToasts.errorWithIcon(
          "Failed to create brand",
          res.message || "Something went wrong",
        );
        // await deleteImagesFromUploadThing(uploadedImageKeys);
      } else {
        jsxToasts.successWithIcon({
          title: "Brand created successfully",
          message: res.message,
        });
        router.push("/admin/brands");
      }
    }

    // On Update
    if (type === "Update") {
      if (!brandId) {
        router.push("/admin/brands");
        return;
      }

      const res = await updateBrand({ ...values, id: brandId });

      if (!res.success) {
        jsxToasts.errorWithIcon(
          "Failed to update brand",
          res.message || "Something went wrong",
        );
      } else {
        jsxToasts.successWithIcon({
          title: "Brand updated successfully",
          message: res.message,
        });
        router.push("/admin/brands");
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
        {/* BRAND NAME & SLUG */}
        <div className="flex flex-col md:flex-row gap-5">
          {/* Brand Name */}
          <FormField
            control={form.control}
            name="name"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof createBrandSchema>,
                "name"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Brand Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Nike, Sony, Apple" {...field} />
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
                z.infer<typeof createBrandSchema>,
                "slug"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <div className="relative flex flex-row space-x-3 items-end">
                    <Input placeholder="e.g. nike, sony, apple" {...field} />
                    <Button
                      type="button"
                      className="bg-slate-800 hover:bg-gray-600 text-white px-4 py-1 mt-2"
                      onClick={() => {
                        form.setValue(
                          "slug",
                          slugify(form.getValues("name"), { lower: true }),
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

        {/* BRAND LOGO */}
        <div className="upload-field">
          <p className="text-sm font-medium mb-2">Brand Logo</p>
          <Card>
            <CardContent className="space-y-2 mt-2">
              {image && image.trim() !== "" && (
                <Image
                  src={image}
                  alt="brand logo"
                  className="w-48 h-auto object-contain object-center rounded-sm"
                  width={192}
                  height={96}
                />
              )}

              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(
                  res: { ufsUrl: string; name: string; key: string }[],
                ) => {
                  if (res && res[0]?.ufsUrl) {
                    form.setValue("image", res[0].ufsUrl);
                    form.setValue("image_key", res[0].key);
                    setUploadedImageKeys((prev) => [...prev, res[0].key]);
                    jsxToasts.successWithIcon({
                      title: "Logo uploaded successfully!",
                      message: "",
                    });
                  }
                }}
                onUploadError={(_error: Error) => {
                  jsxToasts.errorWithIcon(
                    "Failed to upload logo",
                    "Something went wrong",
                  );
                }}
              />
            </CardContent>
          </Card>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="button col-span-2 button-primary w-full">
          {form.formState.isSubmitting ? "Submitting…" : `${type} Brand`}
        </Button>
      </form>
    </Form>
  );
};

export default BrandForm;
