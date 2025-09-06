"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { productDefaultValues } from "@/lib/constants";
import { insertProductSchema, updateProductSchema } from "@/lib/validators";
import { ProductSchema, ProductWithId } from "@/types";
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
} from "../ui/form";
import slugify from "slugify";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import { UploadButton } from "@/lib/uploadthing";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { Checkbox } from "../ui/checkbox";
import { jsxToasts } from "@/lib/customToaster";
import { UploadDropzone } from "@/lib/uploadthing";
import { useState } from "react";
import Details from "./product-form/Details";
import Images from "./product-form/Images";
import Category from "./product-form/Category";

const ProductForm = ({
  type,
  product,
  productId,
}: {
  type: "Create" | "Update";
  product?: ProductSchema;
  productId?: string;
}) => {
  const router = useRouter();

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedImageKeys, setUploadedImageKeys] = useState<string[]>([]);

  const form = useForm<ProductSchema | ProductWithId>({
    resolver: (type === "Update"
      ? zodResolver(updateProductSchema)
      : zodResolver(insertProductSchema)) as any,
    defaultValues:
      product && type === "Update" ? product : productDefaultValues,
  });

  async function deleteImagesFromUploadThing(keys: string[]) {
    await fetch("/api/delete-uploadthing", {
      method: "POST",
      body: JSON.stringify({ keys }),
      headers: { "Content-Type": "application/json" },
    });
  }

  const onSubmit: SubmitHandler<ProductSchema | ProductWithId> = async (
    values
  ) => {
    // On Create
    if (type === "Create") {
      const res = await createProduct(values);

      if (!res.success) {
        jsxToasts.errorWithIcon(
          "Failed to create product",
          res.message || "Something went wrong"
        );
        // Delete uploaded images from UploadThing
        await deleteImagesFromUploadThing(uploadedImageKeys);
      } else {
        jsxToasts.successWithIcon(
          "Product created successfully!",
          res.message || "Product created"
        );
        router.push("/admin/products");
      }
    }

    // On Update
    if (type === "Update") {
      if (!productId) {
        router.push("/admin/products");
        return;
      }

      const res = await updateProduct({ ...values, id: productId });

      if (!res.success) {
        jsxToasts.errorWithIcon(
          "Failed to update product",
          res.message || "Something went wrong"
        );
        // Delete uploaded images from UploadThing
        await deleteImagesFromUploadThing(uploadedImageKeys);
      } else {
        jsxToasts.successWithIcon(
          "Product updated successfully!",
          res.message || "Product updated"
        );
        router.push("/admin/products");
      }
    }
  };

  const images = form.watch("images");
  const isFeatured = form.watch("isFeatured");
  const banner = form.watch("banner");

  return (
    <Form {...form}>
      <form
        method="POST"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8">
        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="category">Category & Brand</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <Details />
          </TabsContent>
          <TabsContent value="images">
            <Images
              uploadProgress={uploadProgress}
              setUploadProgress={setUploadProgress}
              uploadedImageKeys={uploadedImageKeys}
              setUploadedImageKeys={setUploadedImageKeys}
            />
          </TabsContent>
          <TabsContent value="category">
            <Category />
          </TabsContent>
        </Tabs>

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

export default ProductForm;
