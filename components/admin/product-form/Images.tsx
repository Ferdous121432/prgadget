"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ProductSchema } from "@/types";
import React from "react";
import { useFormContext } from "react-hook-form";
import { Dispatch, SetStateAction } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { jsxToasts } from "@/lib/customToaster";
import { UploadButton, UploadDropzone } from "@/lib/uploadthing";
import { Checkbox } from "@radix-ui/react-checkbox";

interface ImagesProps {
  uploadProgress: number;
  setUploadProgress: Dispatch<SetStateAction<number>>;
  uploadedImageKeys: string[];
  setUploadedImageKeys: Dispatch<SetStateAction<string[]>>;
}

function Images({
  uploadProgress,
  setUploadProgress,
  uploadedImageKeys,
  setUploadedImageKeys,
}: ImagesProps) {
  const form = useFormContext<ProductSchema>();

  const images = form.watch("images");
  const isFeatured = form.watch("isFeatured");
  const banner = form.watch("banner");

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Images */}
      <div className="upload-field flex flex-col md:flex-row gap-5">
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
                      <div key={`${image}-${index}`} className="relative group">
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
                            jsxToasts.successWithIcon({
                              title: "Image removed",
                              message:
                                "Image has been removed from the product",
                            });
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
                      onClientUploadComplete={(
                        res: { url: string; key: string }[]
                      ) => {
                        if (res && res.length > 0) {
                          const newImageUrls = res
                            .map((file) => file.url)
                            .filter(Boolean);
                          const newImageKeys = res
                            .map((file) => file.key)
                            .filter(Boolean);
                          setUploadedImageKeys((prev) => [
                            ...prev,
                            ...newImageKeys,
                          ]);

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
                            form.setValue("image_keys", [
                              ...uploadedImageKeys,
                              ...newImageKeys,
                            ]);

                            jsxToasts.successWithIcon({
                              title: "Upload successful",
                              message: `${newImageUrls.length} image(s) uploaded successfully`,
                            });
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
      {/* isFeatured */}
      <div className="upload-field">
        Featured Product
        <Card>
          <CardContent className="space-y-2 mt-2">
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="space-x-2 flex flex-row  items-center justify-start">
                  <FormControl>
                    <Checkbox
                      className={`w-5 h-5 rounded-full border  border-gray-300 focus:ring-2 focus:ring-offset-2 hover:cursor-pointer ${
                        field.value
                          ? "bg-slate-900 dark:bg-slate-50 border-transparent"
                          : "bg-slate-900 border-gray-300"
                      } transition-all`}
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
    </div>
  );
}

export default Images;
