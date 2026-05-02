"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { productSpecificationSections } from "@/lib/product-specifications";
import { ProductSchema, ProductWithId } from "@/types";
import { useFormContext } from "react-hook-form";

function Specifications() {
  const form = useFormContext<ProductSchema | ProductWithId>();

  return (
    <div className="space-y-8">
      {productSpecificationSections.map((section) => (
        <section key={section.key} className="rounded-xl border p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{section.title}</h3>
            <p className="text-sm text-muted-foreground">
              Mirrors the grouped specification layout used on premium device
              product pages.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {section.fields.map((specificationField) => (
              <FormField
                key={`${section.key}.${specificationField.key}`}
                control={form.control}
                name={
                  `specifications.${section.key}.${specificationField.key}` as never
                }
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>{specificationField.label}</FormLabel>
                    <FormControl>
                      {specificationField.multiline ? (
                        <Textarea
                          placeholder={`Enter ${specificationField.label.toLowerCase()}`}
                          className="min-h-28"
                          {...field}
                          value={field.value ?? ""}
                        />
                      ) : (
                        <Input
                          placeholder={`Enter ${specificationField.label.toLowerCase()}`}
                          {...field}
                          value={field.value ?? ""}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default Specifications;
