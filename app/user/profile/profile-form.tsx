"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateUserProfile } from "@/lib/actions/user.actions";
import { jsxToasts } from "@/lib/customToaster";
import { updateProfileSchema } from "@/lib/validators";
import { UpdateUserProfile } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRound } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

const ProfileForm = ({
  initialValues,
}: {
  initialValues: UpdateUserProfile;
}) => {
  const { data: session, update } = useSession();

  const form = useForm<UpdateUserProfile>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: initialValues.name,
      email: initialValues.email,
      phone: initialValues.phone,
    },
  });

  useEffect(() => {
    form.reset({
      name: initialValues.name,
      email: initialValues.email,
      phone: initialValues.phone,
    });
  }, [form, initialValues.email, initialValues.name, initialValues.phone]);

  const onSubmit = async (values: UpdateUserProfile) => {
    const res = await updateUserProfile(values);

    if (!res.success) {
      jsxToasts.errorWithIcon(
        "Failed to update profile",
        res.message || "Something went wrong",
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <UserRound className="size-5" />
          Profile details
        </CardTitle>
        <CardDescription>
          Keep your name and contact number current so orders, delivery, and
          support interactions stay accurate.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                    <FormLabel>Email address</FormLabel>
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
                    <FormLabel>Full name</FormLabel>
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
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Phone number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Phone number"
                        className="input-field"
                        {...field}
                        value={field.value ?? ""}
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
              {form.formState.isSubmitting
                ? "Saving profile..."
                : "Update Profile"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
