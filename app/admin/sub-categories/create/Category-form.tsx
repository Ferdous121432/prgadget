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
  createSubCategories,
  updateSubCategory,
} from "@/lib/actions/category.actions";
import {
  createMainCategorySchema,
  createSubCategorySchema,
  updateSubCategorySchema,
} from "@/lib/validators";
import { CreateSubCategory, UpdateSubCategory } from "@/types";
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
  subCategory?: UpdateSubCategory;
  categoryId?: string;
  categories?: { id: string; name: string }[];
}) => {
  const router = useRouter();

  console.log({
    type,
    subCategory,
    categoryId,
    categories,
  });

  const form = useForm<CreateSubCategory | UpdateSubCategory>({
    resolver: (type === "Update"
      ? zodResolver(updateSubCategorySchema)
      : zodResolver(createSubCategorySchema)) as any,
    defaultValues:
      type === "Update" && subCategory
        ? {
            name: subCategory.name,
            slug: subCategory.slug,
            mainCategoryId: subCategory.mainCategoryId,
          }
        : {
            name: "",
            slug: "",
            mainCategoryId: "",
          },
  });

  const onSubmit: SubmitHandler<CreateSubCategory | UpdateSubCategory> = async (
    values
  ) => {
    console.log("Form Values:", values);
    // On Create
    if (type === "Create") {
      const res = await createSubCategories(values as CreateSubCategory);

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
        router.push("/admin/sub-categories");
      }
    }

    // On Update
    if (type === "Update") {
      console.log("Updating category with ID:", categoryId);
      if (!categoryId) {
        router.push("/admin/sub-categories");
        return;
      }
      const res = await updateSubCategory({ ...values, id: categoryId });

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
        router.push("/admin/sub-categories");
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
            name="mainCategoryId"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof createSubCategorySchema>,
                "mainCategoryId"
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
