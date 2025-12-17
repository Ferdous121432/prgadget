"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { insertProductSchema } from "@/lib/validators";
import { ProductSchema, ProductWithId } from "@/types";
import { SelectValue } from "@radix-ui/react-select";
import { ControllerRenderProps, useFormContext } from "react-hook-form";
import z from "zod";

function Category({
  mainCategories,
  subCategories,
  subSubCategories,
  categoryTags,
  existingCategoryTags,
}: {
  mainCategories?: { id: string; name: string }[];
  subCategories?: { id: string; name: string; mainCategoryId: string }[];
  subSubCategories?: { id: string; name: string; subCategoryId: string }[];
  categoryTags?: { id: string; slug: string; name: string }[];
  existingCategoryTags?: { id: string; slug: string; name: string }[];
}) {
  const form = useFormContext<ProductSchema | ProductWithId>();

  console.log("categoryTags 💥💥💥💥`", categoryTags);
  console.log("existingCategoryTags 🔥🔥🔥", existingCategoryTags);
  console.log(
    "categoryTags IDs available:",
    categoryTags?.map((t) => t.id)
  );
  console.log(
    "existingCategoryTags IDs available:",
    existingCategoryTags?.map((t) => t.id)
  );
  const existingCategoryTagsNames = existingCategoryTags?.map(
    (tag) => tag.name
  );
  const existingCategoryTagsIds = existingCategoryTags?.map((tag) => tag.id);
  console.log("existingCategoryTagsIds 🚀🚀🚀", existingCategoryTagsIds);

  // Note: form defaultValues now has categoryTags as array of IDs,
  // so no need to initialize via useEffect

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Category & Brand */}
      {/* Category */}
      <div className="flex flex-col  gap-5">
        <FormField
          control={form.control}
          name="mainCategoryId"
          render={({
            field,
          }: {
            field: ControllerRenderProps<
              z.infer<typeof insertProductSchema>,
              "mainCategoryId"
            >;
          }) => (
            <FormItem className="w-full">
              <FormLabel>Main Category</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("subCategoryId", "");
                    form.setValue("subSubCategoryId", "");
                  }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select main category" />
                  </SelectTrigger>
                  <SelectContent>
                    {mainCategories?.map((category) => (
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
        {/* Sub Category */}
        <FormField
          control={form.control}
          name="subCategoryId"
          render={({
            field,
          }: {
            field: ControllerRenderProps<
              z.infer<typeof insertProductSchema>,
              "subCategoryId"
            >;
          }) => (
            <FormItem className="w-full">
              <FormLabel>Sub Category</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("subSubCategoryId", "");
                  }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories
                      ?.filter(
                        (cat) =>
                          cat.mainCategoryId ===
                          form.getValues("mainCategoryId")
                      )
                      .map((category) => (
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
        {/* Sub Sub Category */}
        <FormField
          control={form.control}
          name="subSubCategoryId"
          render={({
            field,
          }: {
            field: ControllerRenderProps<
              z.infer<typeof insertProductSchema>,
              "subSubCategoryId"
            >;
          }) => (
            <FormItem className="w-full">
              <FormLabel>Sub Sub Category</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select sub sub category" />
                  </SelectTrigger>
                  <SelectContent>
                    {subSubCategories
                      ?.filter(
                        (cat) =>
                          cat.subCategoryId === form.getValues("subCategoryId")
                      )
                      .map((category) => (
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
        {/* Brand */}
        <FormField
          control={form.control}
          name="brand"
          render={({
            field,
          }: {
            field: ControllerRenderProps<
              z.infer<typeof insertProductSchema>,
              "brand"
            >;
          }) => (
            <FormItem className="w-full">
              <FormLabel>Brand</FormLabel>
              <FormControl>
                <Input placeholder="Enter brand" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category Tags */}
        <FormField
          control={form.control}
          name="categoryTags"
          render={({
            field,
          }: {
            field: ControllerRenderProps<
              z.infer<typeof insertProductSchema>,
              "categoryTags"
            >;
          }) => {
            const currentIds: string[] = field.value || [];
            console.log("Current categoryTags field.value:", field.value);
            console.log("currentIds array:", currentIds);

            return (
              <FormItem className="w-full">
                <FormLabel>Category Tags</FormLabel>
                <FormControl>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (currentIds.includes(value)) {
                        // if already selected, do nothing
                        console.log("Tag already selected:", value);
                        return;
                      } else {
                        // Add the tag
                        const updated = [...currentIds, value];
                        console.log("Selected tags:", updated);
                        field.onChange(updated);
                      }
                    }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category tags" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryTags?.map((tag) => (
                        <SelectItem
                          key={`category-tag-${tag.id}`}
                          value={tag.id}>
                          {tag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
                <div className="mt-2 flex flex-wrap gap-2">
                  {currentIds.map((tagId) => {
                    // Look up name from categoryTags first, then fallback to existingCategoryTags
                    const foundInCategoryTags = categoryTags?.find(
                      (tag) => tag.id === tagId
                    );
                    const foundInExisting = existingCategoryTags?.find(
                      (tag) => tag.id === tagId
                    );
                    const displayName =
                      foundInCategoryTags?.name || foundInExisting?.name;

                    // console.log("tagId:", tagId);
                    // console.log("foundInCategoryTags:", foundInCategoryTags);
                    // console.log("foundInExisting:", foundInExisting);
                    // console.log("displayName:", displayName);

                    return displayName ? (
                      <div
                        key={`tag-${tagId}`}
                        className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                        <span>{displayName}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => {
                            const updated = currentIds.filter(
                              (id) => id !== tagId
                            );
                            field.onChange(updated);
                          }}>
                          ×
                        </Button>
                      </div>
                    ) : null;
                  })}
                </div>
              </FormItem>
            );
          }}
        />
      </div>
    </div>
  );
}

export default Category;
