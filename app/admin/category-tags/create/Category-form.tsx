"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  createCategoryTag,
  updateCategoryTag,
} from "@/lib/actions/category-tag.actions";
import { categoryTagDefaultValues } from "@/lib/constants";
import { jsxToasts } from "@/lib/customToaster";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ControllerRenderProps, SubmitHandler, useForm } from "react-hook-form";
import slugify from "slugify";
import { z } from "zod";

const createCategoryTagSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
});

type CreateCategoryTag = z.infer<typeof createCategoryTagSchema>;

const CategoryForm = ({
  type,
  category,
  categoryId,
}: {
  type: "Create" | "Update";
  category?: CreateCategoryTag;
  categoryId?: string;
}) => {
  const router = useRouter();

  const form = useForm<CreateCategoryTag>({
    resolver: zodResolver(createCategoryTagSchema),
    defaultValues:
      category && type === "Update" ? category : categoryTagDefaultValues,
  });

  const onSubmit: SubmitHandler<CreateCategoryTag> = async (values) => {
    // On Create
    if (type === "Create") {
      const res = await createCategoryTag(values);

      if (!res.success) {
        jsxToasts.errorWithIcon(
          "Failed to create category tag",
          res.message || "Something went wrong"
        );
      } else {
        jsxToasts.successWithIcon({
          title: "Category tag created successfully",
          message: res.message,
        });
        router.push("/admin/category-tags");
      }
    }

    // On Update
    if (type === "Update") {
      if (!categoryId) {
        router.push("/admin/category-tags");
        return;
      }

      const res = await updateCategoryTag({ ...values, slug: categoryId });

      if (!res.success) {
        jsxToasts.errorWithIcon(
          "Failed to update category tag",
          res.message || "Something went wrong"
        );
      } else {
        jsxToasts.successWithIcon({
          title: "Category tag updated successfully",
          message: res.message,
        });
        router.push("/admin/category-tags");
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
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof createCategoryTagSchema>,
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
                z.infer<typeof createCategoryTagSchema>,
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
