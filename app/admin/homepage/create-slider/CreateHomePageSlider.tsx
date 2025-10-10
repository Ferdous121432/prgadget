"use client";

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
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { UploadButton } from "@/lib/uploadthing";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { jsxToasts } from "@/lib/customToaster";
import { useState } from "react";
import { createHomeSlider } from "@/lib/actions/homepage.actions";
import { sliderFormSchema } from "@/lib/validators";
import { SliderFormValues } from "@/types";
import { Input } from "@/components/ui/input";
import { deleteImagesFromUploadThing } from "@/lib/hooks/uploadthing";

const CreateHomePageSlider = () => {
  const router = useRouter();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedImageKeys, setUploadedImageKeys] = useState<string[]>([]);

  const form = useForm<SliderFormValues>({
    resolver: zodResolver(sliderFormSchema),
  });

  const onSubmit: SubmitHandler<SliderFormValues> = async (values: any) => {
    const res = await createHomeSlider(values);

    if (!res.success) {
      jsxToasts.errorWithIcon(
        "Failed to create slider",
        res.message || "Something went wrong"
      );
      // Delete uploaded images from UploadThing
      await deleteImagesFromUploadThing(uploadedImageKeys);
    } else {
      jsxToasts.successWithIcon({
        title: "Slider created successfully",
        message: res.message,
        href: "/admin/homepage",
        hrefTitle: "Go to homepage",
      });
      router.push("/admin/homepage");
    }
  };

  const image = form.watch("image_url");

  return (
    <Form {...form}>
      <form
        method="POST"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8">
        <div className="upload-field">
          <Card>
            <CardContent className="space-y-2 mt-2">
              {image && image.trim() !== "" && (
                <Image
                  src={image}
                  alt="banner image"
                  className="w-full h-auto object-cover object-center rounded-sm"
                  width={1200}
                  height={400}
                />
              )}

              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(
                  res: { ufsUrl: string; name: string; key: string }[]
                ) => {
                  if (res && res[0]?.ufsUrl) {
                    form.setValue("image_url", res[0].ufsUrl);
                    form.setValue("image_name", res[0].name);
                    form.setValue("image_key", res[0].key);

                    // Track uploaded image key for deletion if needed
                    setUploadedImageKeys((prev) => [...prev, res[0].key]);

                    jsxToasts.successWithIcon({
                      title: "Image uploaded successfully!",
                      message: "",
                      href: "/admin/homepage",
                      hrefTitle: "Go to homepage",
                    });
                  }
                }}
                onUploadError={(error: Error) => {
                  jsxToasts.errorWithIcon(
                    "Failed to upload Image",
                    "Something went wrong"
                  );
                }}
              />
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col md:flex-row gap-5">
          {/* Linked_url*/}
          <FormField
            control={form.control}
            name="linked_url"
            render={({
              field,
            }: {
              field: ControllerRenderProps<SliderFormValues, "linked_url">;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Linked URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter linked URL"
                    {...field}
                    value={field.value ?? ""}
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
            {form.formState.isSubmitting ? "Submitting" : "Create Slider"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateHomePageSlider;
