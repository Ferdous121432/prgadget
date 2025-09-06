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
import { Textarea } from "@/components/ui/textarea";
import { insertProductSchema } from "@/lib/validators";
import { ProductSchema } from "@/types";
import React from "react";
import { useFormContext, ControllerRenderProps } from "react-hook-form";
import slugify from "slugify";
import z from "zod";

function Category() {
  const form = useFormContext<ProductSchema>();

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
                <Input placeholder="Enter main category" {...field} />
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
                <Input placeholder="Enter sub category" {...field} />
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
                <Input placeholder="Enter sub sub category" {...field} />
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
