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
import { Textarea } from "@/components/ui/textarea";
import {
  deleteUserShippingAddress,
  saveUserShippingAddress,
  selectUserShippingAddress,
  setDefaultUserShippingAddress,
} from "@/lib/actions/user.actions";
import { shippingAddressDefaultValues } from "@/lib/constants";
import { jsxToasts } from "@/lib/customToaster";
import { formatShippingAddressLines } from "@/lib/shipping-address";
import { saveShippingAddressSchema } from "@/lib/validators";
import { SavedShippingAddress } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CheckCircle2,
  Loader,
  MapPin,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

type ShippingAddressEditorProps = {
  initialValues: SavedShippingAddress;
  isPending?: boolean;
  onCancel?: () => void;
  onSubmit: (values: SavedShippingAddress) => Promise<void> | void;
};

type ShippingAddressBookProps = {
  addresses: SavedShippingAddress[];
  selectedAddressId?: string | null;
  legacyAddress?: SavedShippingAddress | null;
  mode?: "checkout" | "account";
};

function createNewAddressTemplate(
  isFirstAddress: boolean,
): SavedShippingAddress {
  return {
    ...shippingAddressDefaultValues,
    isDefault: isFirstAddress,
  };
}

function ShippingAddressEditor({
  initialValues,
  isPending,
  onCancel,
  onSubmit,
}: ShippingAddressEditorProps) {
  const form = useForm<z.infer<typeof saveShippingAddressSchema>>({
    resolver: zodResolver(saveShippingAddressSchema),
    defaultValues: initialValues || shippingAddressDefaultValues,
  });

  useEffect(() => {
    form.reset(initialValues || shippingAddressDefaultValues);
  }, [form, initialValues]);

  const handleSubmit: SubmitHandler<
    z.infer<typeof saveShippingAddressSchema>
  > = async (values) => {
    await onSubmit(values);
  };

  const isEditing = Boolean(initialValues?.id);

  return (
    <div className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold">
          {isEditing ? "Edit shipping address" : "Add shipping address"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Capture the same details customers expect in a modern checkout,
          including label, phone, address lines, and delivery notes.
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address label</FormLabel>
                <FormControl>
                  <Input placeholder="Home, Office, Parents" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="streetAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 1</FormLabel>
                <FormControl>
                  <Input placeholder="House, street, area" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="addressLine2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 2</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Apartment, suite, landmark"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State / Province</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter state or province"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter postal code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="deliveryInstructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Instructions</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Gate code, landmark, preferred drop-off notes"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isDefault"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-xl border p-4">
                <div>
                  <FormLabel>Set as default shipping address</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Future checkouts will preselect this address.
                  </p>
                </div>
                <FormControl>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border"
                    checked={Boolean(field.value)}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              className="button-primary"
              disabled={isPending}>
              {isPending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              {isEditing ? "Update address" : "Save address"}
            </Button>

            {onCancel ? (
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={onCancel}>
                Cancel editing
              </Button>
            ) : null}
          </div>
        </form>
      </Form>
    </div>
  );
}

const ShippingAddressForm = ({
  addresses,
  selectedAddressId,
  legacyAddress,
  mode = "checkout",
}: ShippingAddressBookProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isCheckoutMode = mode === "checkout";

  const selectedAddress = useMemo(
    () =>
      addresses.find((address) => address.id === selectedAddressId) ??
      addresses.find((address) => address.isDefault) ??
      null,
    [addresses, selectedAddressId],
  );

  const [editingAddress, setEditingAddress] =
    useState<SavedShippingAddress | null>(null);

  const handleSaveAddress = async (values: SavedShippingAddress) => {
    startTransition(async () => {
      const result = await saveUserShippingAddress(values);

      if (!result.success) {
        jsxToasts.errorWithIcon(
          "Could not save shipping address",
          result.message || "Something went wrong",
        );
        return;
      }

      jsxToasts.successWithIcon({
        title: values.id
          ? "Shipping address updated"
          : "Shipping address saved",
        message: result.message,
      });
      setEditingAddress(null);
      router.refresh();
    });
  };

  const handleSelectAddress = (addressId: string) => {
    startTransition(async () => {
      const result = await selectUserShippingAddress(addressId);

      if (!result.success) {
        jsxToasts.errorWithIcon(
          "Could not select shipping address",
          result.message || "Something went wrong",
        );
        return;
      }

      jsxToasts.successWithIcon({
        title: isCheckoutMode
          ? "Shipping address selected"
          : "Address updated for your account",
        message: isCheckoutMode
          ? "Continuing to payment method"
          : "This address will be used for your next order.",
      });

      if (isCheckoutMode) {
        router.push("/payment-method");
      }

      router.refresh();
    });
  };

  const handleSetDefault = (addressId: string) => {
    startTransition(async () => {
      const result = await setDefaultUserShippingAddress(addressId);

      if (!result.success) {
        jsxToasts.errorWithIcon(
          "Could not update default address",
          result.message || "Something went wrong",
        );
        return;
      }

      jsxToasts.successWithIcon({
        title: "Default address updated",
        message: result.message,
      });
      router.refresh();
    });
  };

  const handleDeleteAddress = (addressId: string) => {
    startTransition(async () => {
      const result = await deleteUserShippingAddress(addressId);

      if (!result.success) {
        jsxToasts.errorWithIcon(
          "Could not delete address",
          result.message || "Something went wrong",
        );
        return;
      }

      jsxToasts.successWithIcon({
        title: "Address removed",
        message: result.message,
      });

      if (editingAddress?.id === addressId) {
        setEditingAddress(null);
      }

      router.refresh();
    });
  };

  const handleContinue = () => {
    if (!isCheckoutMode) {
      return;
    }

    if (!selectedAddress) {
      jsxToasts.errorWithIcon(
        "Select a shipping address first",
        "Choose a saved address or save a new one before continuing.",
      );
      return;
    }

    router.push("/payment-method");
  };

  return (
    <div className="mx-auto mt-6 grid w-full max-w-6xl gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="h2-bold">
              {isCheckoutMode ? "Shipping Address" : "Address Book"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isCheckoutMode
                ? "Save multiple delivery addresses, choose one for this checkout, and keep a default ready for future orders."
                : "Manage saved delivery addresses, choose your default, and keep your next order ready with one click."}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setEditingAddress(
                createNewAddressTemplate(addresses.length === 0),
              )
            }>
            <Plus className="size-4" />
            Add new address
          </Button>
        </div>

        {legacyAddress && addresses.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">
                Existing address found
              </CardTitle>
              <CardDescription>
                Your account already has an older shipping address. Review it
                below and save it to your new address book to keep using it.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => {
            const isSelected = address.id === selectedAddress?.id;

            return (
              <Card
                key={address.id}
                className={isSelected ? "border-primary shadow-sm" : ""}>
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <MapPin className="size-4" />
                        {address.label}
                      </CardTitle>
                      <CardDescription>
                        {isSelected
                          ? isCheckoutMode
                            ? "Selected for this checkout"
                            : "Selected for your next order"
                          : "Saved delivery address"}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2 text-xs">
                      {address.isDefault ? (
                        <span className="rounded-full bg-primary/10 px-2 py-1 font-medium text-primary">
                          Default
                        </span>
                      ) : null}
                      {isSelected ? (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-1 font-medium text-emerald-700">
                          Selected
                        </span>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {formatShippingAddressLines(address).map((line) => (
                      <p key={`${address.id}-${line}`}>{line}</p>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!isSelected ? (
                      <Button
                        type="button"
                        size="sm"
                        className="button-primary"
                        disabled={isPending}
                        onClick={() => handleSelectAddress(address.id!)}>
                        <CheckCircle2 className="size-4" />
                        {isCheckoutMode ? "Deliver here" : "Use next"}
                      </Button>
                    ) : null}

                    {!address.isDefault ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => handleSetDefault(address.id!)}>
                        <Star className="size-4" />
                        Make default
                      </Button>
                    ) : null}

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => setEditingAddress(address)}>
                      <Pencil className="size-4" />
                      Edit
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={isPending}
                      onClick={() => handleDeleteAddress(address.id!)}>
                      <Trash2 className="size-4" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {addresses.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <MapPin className="size-8 text-muted-foreground" />
              <div className="space-y-1">
                <p className="font-medium">No saved shipping addresses yet</p>
                <p className="text-sm text-muted-foreground">
                  {isCheckoutMode
                    ? "Add your first delivery address to continue checkout."
                    : "Add your first delivery address so future orders are faster to place."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        {editingAddress ? (
          <ShippingAddressEditor
            initialValues={editingAddress}
            isPending={isPending}
            onCancel={() => setEditingAddress(null)}
            onSubmit={handleSaveAddress}
          />
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {isCheckoutMode ? "Checkout selection" : "Selected address"}
            </CardTitle>
            <CardDescription>
              {isCheckoutMode
                ? "Continue with the address currently selected for this order."
                : "This address is currently selected on your account for the next order."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedAddress ? (
              <div className="space-y-1 text-sm text-muted-foreground">
                {formatShippingAddressLines(selectedAddress).map((line) => (
                  <p key={`selected-${line}`}>{line}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isCheckoutMode
                  ? "Save or choose a shipping address to continue."
                  : "Save or choose a shipping address to keep your account ready for checkout."}
              </p>
            )}

            {isCheckoutMode ? (
              <Button
                type="button"
                className="w-full button-primary"
                disabled={!selectedAddress || isPending}
                onClick={handleContinue}>
                Continue to payment
                <ArrowRight className="size-4" />
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShippingAddressForm;
