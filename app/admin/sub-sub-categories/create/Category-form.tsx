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
import { jsxToasts } from "@/lib/customToaster";
import {
  createSubSubCategories,
  updateSubSubCategory,
} from "@/lib/actions/category.actions";
import {
  createSubSubCategorySchema,
  updateSubSubCategorySchema,
} from "@/lib/validators";
import { CreateSubSubCategory, UpdateSubSubCategory } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CategoryForm = ({
  type,
  subCategory,
  categoryId,
  categories,
}: {
  type: "Create" | "Update";
  subCategory?: UpdateSubSubCategory;
  categoryId?: string;
  categories?: { id: string; name: string }[];
}) => {
  const router = useRouter();

  const form = useForm<CreateSubSubCategory | UpdateSubSubCategory>({
    resolver: (type === "Update"
      ? zodResolver(updateSubSubCategorySchema)
      : zodResolver(createSubSubCategorySchema)) as any,
    defaultValues:
      type === "Update" && subCategory
        ? {
            id: categoryId,
            name: subCategory.name,
            slug: subCategory.slug,
            subCategoryId: subCategory.subCategoryId,
          }
        : {
            name: "",
            slug: "",
            subCategoryId: "",
          },
  });

  const onSubmit: SubmitHandler<
    CreateSubSubCategory | UpdateSubSubCategory
  > = async (values) => {
    // On Create
    if (type === "Create") {
      const res = await createSubSubCategories(values as CreateSubSubCategory);

      if (!res.success) {
        jsxToasts.errorWithIcon(
          "Failed to create category",
          res.message || "Something went wrong"
        );
      } else {
        jsxToasts.successWithIcon({
          title: "Category created successfully",
          message: res.message,
        });
        router.push("/admin/sub-sub-categories");
      }
    }
    // On Update
    if (type === "Update") {
      const id = categoryId;
      if (!id) {
        router.push("/admin/sub-sub-categories");
        return;
      }
      const res = await updateSubSubCategory({ ...values, id });

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
        router.push("/admin/sub-sub-categories");
      }
    }
  };

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
            render={({ field }) => (
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
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Slug</FormLabel>
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

        {/* PARENT CATEGORY */}
        <div>
          <FormField
            control={form.control}
            name="subCategoryId"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof createSubSubCategorySchema>,
                "subCategoryId"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Parent Category</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select parent category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
