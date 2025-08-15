"use client";

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

  const form = useForm<ProductSchema | ProductWithId>({
    resolver: (type === "Update"
      ? zodResolver(updateProductSchema)
      : zodResolver(insertProductSchema)) as any,
    defaultValues:
      product && type === "Update" ? product : productDefaultValues,
  });

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
        <div className="flex flex-col md:flex-row gap-5">
          {/* Name */}
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
        <div className="flex flex-col md:flex-row gap-5">
          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "category"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Enter category" {...field} />
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
        <div className="flex flex-col md:flex-row gap-5">
          {/* Price */}
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
        <div className="upload-field flex flex-col md:flex-row gap-5">
          {/* Images */}
          <FormField
            control={form.control}
            name="images"
            render={() => (
              <FormItem className="w-full">
                <FormLabel>Images</FormLabel>
                <Card>
                  <CardContent className="space-y-2 mt-2 min-h-48">
                    {/* Image Preview with Remove Functionality */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {images.map((image: string, index: number) => (
                        <div
                          key={`${image}-${index}`}
                          className="relative group">
                          <Image
                            src={image}
                            alt={`Product image ${index + 1}`}
                            className="w-20 h-20 object-cover object-center rounded-sm border"
                            width={100}
                            height={100}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updatedImages = images.filter(
                                (_, i) => i !== index
                              );
                              form.setValue("images", updatedImages);
                              jsxToasts.successWithIcon(
                                "Image removed",
                                "Image deleted successfully"
                              );
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
                            title="Remove image">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Upload Progress Indicator */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    )}

                    <FormControl>
                      <UploadDropzone
                        endpoint="imageDropzone"
                        onClientUploadComplete={(res: { url: string }[]) => {
                          if (res && res.length > 0) {
                            const newImageUrls = res
                              .map((file) => file.url)
                              .filter(Boolean);

                            if (newImageUrls.length > 0) {
                              // Check if adding new images would exceed any limits
                              const totalImages =
                                images.length + newImageUrls.length;
                              if (totalImages > 10) {
                                // Set your own limit
                                jsxToasts.errorWithIcon(
                                  "Too many images",
                                  `Maximum 10 images allowed. You currently have ${images.length} images.`
                                );
                                return;
                              }

                              form.setValue("images", [
                                ...images,
                                ...newImageUrls,
                              ]);
                              jsxToasts.successWithIcon(
                                "Upload successful",
                                `${newImageUrls.length} image(s) uploaded successfully`
                              );
                            } else {
                              jsxToasts.errorWithIcon(
                                "Upload failed",
                                "No valid image URLs received from upload"
                              );
                            }
                          } else {
                            jsxToasts.errorWithIcon(
                              "Upload failed",
                              "No files were uploaded"
                            );
                          }
                          // Reset progress
                          setUploadProgress(0);
                        }}
                        onUploadError={(error: Error) => {
                          console.error("Upload error:", error);

                          // Handle specific error types
                          if (error.message.includes("FileSizeMismatch")) {
                            jsxToasts.errorWithIcon(
                              "File too large",
                              "Each image must be under 1MB"
                            );
                          } else if (
                            error.message.includes("FileCountMismatch")
                          ) {
                            jsxToasts.errorWithIcon(
                              "Too many files",
                              "Please select 1-5 images at a time"
                            );
                          } else {
                            jsxToasts.errorWithIcon(
                              "Upload failed",
                              error.message || "An unknown error occurred"
                            );
                          }
                          // Reset progress on error
                          setUploadProgress(0);
                        }}
                        onUploadBegin={(name: string) => {
                          jsxToasts.infoWithIcon(
                            "Uploading images...",
                            `Processing ${name}. Please wait...`
                          );
                        }}
                        onUploadProgress={(progress: number) => {
                          setUploadProgress(progress);
                        }}
                        config={{
                          mode: "auto", // or "manual" for more control
                        }}
                        className="w-full h-32 border-dashed border-2 border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                        content={{
                          uploadIcon: "📸",
                          label: "Drop images here or click to browse",
                          allowedContent: "Images up to 1MB (max 5 files)",
                        }}
                      />
                    </FormControl>
                  </CardContent>
                </Card>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="upload-field">
          {/* isFeatured */}
          Featured Product
          <Card>
            <CardContent className="space-y-2 mt-2">
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="space-x-2 items-center">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Is Featured?</FormLabel>
                  </FormItem>
                )}
              />
              {isFeatured && banner && (
                <Image
                  src={banner}
                  alt="banner image"
                  className="w-full object-cover object-center rounded-sm"
                  width={1920}
                  height={680}
                />
              )}

              {isFeatured && !banner && (
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res: { url: string }[]) => {
                    form.setValue("banner", res[0].url);
                  }}
                  onUploadError={(error: Error) => {
                    jsxToasts.errorWithIcon(
                      "Failed to upload Image",
                      "Something went wrong"
                    );
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          {/* Description */}
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
                  <Textarea
                    placeholder="Enter product description"
                    className="resize-none"
                    {...field}
                  />
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

export default ProductForm;
