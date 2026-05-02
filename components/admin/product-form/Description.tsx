"use client";

import DescriptionBuilder from "@/components/admin/product-form/DescriptionBuilder";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ProductSchema, ProductWithId } from "@/types";
import { useFormContext } from "react-hook-form";

function Description() {
  const form = useFormContext<ProductSchema | ProductWithId>();

  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel>Description</FormLabel>
          <DescriptionBuilder value={field.value} onChange={field.onChange} />
          <div className="space-y-3 text-xs text-muted-foreground">
            <p>
              Saved as structured JSON blocks. Use headings, paragraphs,
              callouts, lists, feature grids, two-column splits, image blocks,
              and button links instead of raw HTML or CSS.
            </p>
            <p>
              This keeps the storefront layout stable while still letting you
              build richer product storytelling sections.
            </p>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default Description;
