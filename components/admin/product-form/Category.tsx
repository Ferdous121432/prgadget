"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { insertProductSchema } from "@/lib/validators";
import { ProductSchema, ProductWithId } from "@/types";
import { SelectValue } from "@radix-ui/react-select";
import Link from "next/link";
import { ControllerRenderProps, useFormContext } from "react-hook-form";
import z from "zod";

function Category({
  mainCategories,
  subCategories,
  subSubCategories,
  brandOptions,
  categoryTags,
  existingCategoryTags,
}: {
  mainCategories?: { id: string; name: string }[];
  subCategories?: { id: string; name: string; mainCategoryId: string }[];
  subSubCategories?: { id: string; name: string; subCategoryId: string }[];
  brandOptions?: { id: string; name: string }[];
  categoryTags?: { id: string; slug: string; name: string }[];
  existingCategoryTags?: { id: string; slug: string; name: string }[];
}) {
  const form = useFormContext<ProductSchema | ProductWithId>();
  const hasBrandOptions = (brandOptions?.length ?? 0) > 0;

  const selectedMainCategoryId = form.watch("mainCategoryId");
  const selectedSubCategoryId = form.watch("subCategoryId");

  const availableSubCategories =
    subCategories?.filter(
      (category) => category.mainCategoryId === selectedMainCategoryId,
    ) ?? [];

  const availableSubSubCategories =
    subSubCategories?.filter(
      (category) => category.subCategoryId === selectedSubCategoryId,
    ) ?? [];

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex flex-col gap-5">
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
                  value={field.value || undefined}
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("subSubCategoryId", "");
                  }}
                  disabled={
                    !selectedMainCategoryId ||
                    availableSubCategories.length === 0
                  }>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        !selectedMainCategoryId
                          ? "Select main category first"
                          : availableSubCategories.length === 0
                            ? "No sub categories available"
                            : "Select sub category"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Use sub category only when it improves browsing and filtering.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

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
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={
                    !selectedSubCategoryId ||
                    availableSubSubCategories.length === 0
                  }>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        !selectedSubCategoryId
                          ? "Select sub category first"
                          : availableSubSubCategories.length === 0
                            ? "No sub sub categories available"
                            : "Select sub sub category"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubSubCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Reserve sub sub category for leaf-level shopping contexts.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brandId"
          render={({
            field,
          }: {
            field: ControllerRenderProps<
              z.infer<typeof insertProductSchema>,
              "brandId"
            >;
          }) => (
            <FormItem className="w-full">
              <FormLabel>Brand</FormLabel>
              <FormControl>
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={!hasBrandOptions}>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        hasBrandOptions
                          ? "Select brand"
                          : "Create a brand before creating products"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {brandOptions?.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <p className="text-xs text-muted-foreground">
                {hasBrandOptions
                  ? "Optional. Connect a standalone brand record when relevant."
                  : "Optional. No brands available yet unless you create one from the Brands admin page."}
                {!hasBrandOptions && (
                  <>
                    {" "}
                    <Link href="/admin/brands/create" className="underline">
                      Create brand
                    </Link>
                    .
                  </>
                )}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

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

            return (
              <FormItem className="w-full">
                <FormLabel>Category Tags</FormLabel>
                <FormControl>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (currentIds.includes(value)) {
                        return;
                      }

                      field.onChange([...currentIds, value]);
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
                    const foundInCategoryTags = categoryTags?.find(
                      (tag) => tag.id === tagId,
                    );
                    const foundInExisting = existingCategoryTags?.find(
                      (tag) => tag.id === tagId,
                    );
                    const displayName =
                      foundInCategoryTags?.name || foundInExisting?.name;

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
                            field.onChange(
                              currentIds.filter((id) => id !== tagId),
                            );
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
