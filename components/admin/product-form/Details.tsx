"use client";

import DescriptionBuilder from "@/components/admin/product-form/DescriptionBuilder";
import { Button } from "@/components/ui/button";
import {
  FormControl as FieldControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { insertProductSchema } from "@/lib/validators";
import { ProductSchema, ProductWithId } from "@/types";
import { ControllerRenderProps, useFormContext } from "react-hook-form";
import slugify from "slugify";
import z from "zod";

function Details() {
  const form = useFormContext<ProductSchema | ProductWithId>();

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Name & slug */}
      <div className="flex flex-col w-full md:flex-row gap-5">
        <FormField
          control={form.control}
          name="name"
          render={({
            field,
          }: {
            field: ControllerRenderProps<
              z.infer<typeof insertProductSchema>,
              "name"
            >;
          }) => (
            <FormItem className="w-full">
              <FormLabel>Name</FormLabel>
              <FieldControl>
                <Input placeholder="Enter product name" {...field} />
              </FieldControl>
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
              z.infer<typeof insertProductSchema>,
              "slug"
            >;
          }) => (
            <FormItem className="w-full">
              <FormLabel>Slug</FormLabel>
              <FieldControl>
                <div className="relative  flex flex-row space-x-3 items-end ">
                  <Input placeholder="Enter slug" {...field} />
                  <Button
                    type="button"
                    className="bg-slate-800 hover:bg-gray-600 text-white px-4 py-2 rounded "
                    onClick={() => {
                      form.setValue(
                        "slug",
                        slugify(form.getValues("name"), { lower: true }),
                      );
                    }}>
                    Generate
                  </Button>
                </div>
              </FieldControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {/* Price & Stock */}
      <div className="flex flex-col md:flex-row gap-5">
        <FormField
          control={form.control}
          name="price"
          render={({
            field,
          }: {
            field: ControllerRenderProps<
              z.infer<typeof insertProductSchema>,
              "price"
            >;
          }) => (
            <FormItem className="w-full">
              <FormLabel>Price</FormLabel>
              <FieldControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter product price"
                  {...field}
                />
              </FieldControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="offerPrice"
          render={({
            field,
          }: {
            field: ControllerRenderProps<
              z.infer<typeof insertProductSchema>,
              "offerPrice"
            >;
          }) => (
            <FormItem className="w-full">
              <FormLabel>Offer Price</FormLabel>
              <FieldControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Optional discounted price"
                  {...field}
                  value={field.value ?? ""}
                />
              </FieldControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Stock */}
        <FormField
          control={form.control}
          name="stock"
          render={({
            field,
          }: {
            field: ControllerRenderProps<
              z.infer<typeof insertProductSchema>,
              "stock"
            >;
          }) => (
            <FormItem className="w-full">
              <FormLabel>Stock</FormLabel>
              <FieldControl>
                <Input type="number" placeholder="Enter stock" {...field} />
              </FieldControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="shortDescription"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>Short Description</FormLabel>
            <DescriptionBuilder value={field.value} onChange={field.onChange} />
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>
                Saved as structured JSON blocks, just like the main description.
              </p>
              <p>
                Keep this section concise for the summary area above the full
                product description.
              </p>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export default Details;
