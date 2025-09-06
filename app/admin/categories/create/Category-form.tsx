"use client";

import { categoryDefaultValues, productDefaultValues } from "@/lib/constants";
import {
  createCategorySchema,
  insertProductSchema,
  updateCategorySchema,
  updateProductSchema,
} from "@/lib/validators";
import { Category, ProductSchema, ProductWithId } from "@/types";
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
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import { jsxToasts } from "@/lib/customToaster";
import { useState } from "react";
import { createCategory, updateCategory } from "@/lib/actions/category.actions";

const CategoryForm = ({
  type,
  category,
  categoryId,
}: {
  type: "Create" | "Update";
  category?: Category;
  categoryId?: string;
}) => {
  const router = useRouter();

  const form = useForm<Category>({
    resolver: (type === "Update"
      ? zodResolver(updateCategorySchema)
      : zodResolver(createCategorySchema)) as any,
    defaultValues:
      category && type === "Update" ? category : categoryDefaultValues,
  });

  const onSubmit: SubmitHandler<Category> = async (values) => {
    // On Create
    if (type === "Create") {
      const res = await createCategory(values);

      if (!res.success) {
        jsxToasts.errorWithIcon(
          "Failed to create category",
          res.message || "Something went wrong"
        );
      } else {
        jsxToasts.successWithIcon(
          "Category created successfully!",
          res.message || "Category created"
        );
        router.push("/admin/categories");
      }
    }

    // On Update
    if (type === "Update") {
      if (!categoryId) {
        router.push("/admin/categories");
        return;
      }

      const res = await updateCategory({ ...values, id: categoryId });

      if (!res.success) {
        jsxToasts.errorWithIcon(
          "Failed to update category",
          res.message || "Something went wrong"
        );
      } else {
        jsxToasts.successWithIcon(
          "Category updated successfully!",
          res.message || "Category updated"
        );
        router.push("/admin/categories");
      }
    }
  };

  return (
    <Form {...form}>
      <form
        method="POST"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8">
        <div className="flex flex-col md:flex-row gap-5">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof createCategorySchema>,
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
                z.infer<typeof createCategorySchema>,
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
        <div className="flex flex-col md:flex-row gap-5">
          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof createCategorySchema>,
                "description"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter product description"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
