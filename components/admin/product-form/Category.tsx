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
import React from "react";
import { useFormContext, ControllerRenderProps } from "react-hook-form";
import slugify from "slugify";
import z from "zod";

function Category({
  mainCategories,
  subCategories,
  subSubCategories,
}: {
  mainCategories?: { id: string; name: string }[];
  subCategories?: { id: string; name: string; mainCategoryId: string }[];
  subSubCategories?: { id: string; name: string; subCategoryId: string }[];
}) {
  const form = useFormContext<ProductSchema | ProductWithId>();
  // console.log({
  //   mainCategories,
  //   subCategories,
  //   subSubCategories,
  // });
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
      </div>
    </div>
  );
}

export default Category;
