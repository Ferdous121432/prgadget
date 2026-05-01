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
import HtmlEditor from "@/components/ui/html-editor";
import { insertProductSchema } from "@/lib/validators";
import { ProductSchema, ProductWithId } from "@/types";
import React from "react";
import { useFormContext, ControllerRenderProps } from "react-hook-form";
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
              z.infer<typeof insertProductSchema>,
              "slug"
            >;
          }) => (
            <FormItem className="w-full">
              <FormLabel>Slug</FormLabel>
              <FormControl>
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
              </FormControl>
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
              <FormControl>
                <Input placeholder="Enter product price" {...field} />
              </FormControl>
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
              <FormControl>
                <Input placeholder="Enter stock" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {/* Description */}
      <div>
        <FormField
          control={form.control}
          name="description"
          render={({
            field,
          }: {
            field: ControllerRenderProps<
              z.infer<typeof insertProductSchema>,
              "description"
            >;
          }) => (
            <FormItem className="w-full">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <HtmlEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Write a polished HTML description with headings, lists, quotes, and links"
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Use headings, lists, and links for SEO-friendly structured copy.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

export default Details;
