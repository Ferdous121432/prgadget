"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateUserProfile } from "@/lib/actions/user.actions";
import { jsxToasts } from "@/lib/customToaster";
import { updateProfileSchema } from "@/lib/validators";
import { UpdateUserProfile } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";

const ProfileForm = () => {
  const { data: session, update } = useSession();
  console.log("Session in ProfileForm:", session);

  const form = useForm<UpdateUserProfile>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
    },
  });

  const onSubmit = async (values: UpdateUserProfile) => {
    const res = await updateUserProfile(values);

    if (!res.success) {
      jsxToasts.errorWithIcon(
        "Failed to update profile",
        res.message || "Something went wrong"
      );
    }

    const newSession = {
      ...session,
      user: {
        ...session?.user,
        name: values.name,
      },
    };

    await update(newSession);

    jsxToasts.successWithIcon({
      title: "Profile updated successfully",
      message: res.message,
    });
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-5"
        onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    disabled
                    placeholder="Email"
                    className="input-field"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    placeholder="Name"
                    className="input-field"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="button col-span-2 button-primary w-full"
          disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Submitting..." : "Update Profile"}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
