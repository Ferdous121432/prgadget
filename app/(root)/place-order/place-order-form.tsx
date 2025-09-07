"use client";

import { useRouter } from "next/navigation";
import { Check, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import { createOrder } from "@/lib/actions/order.actions";
import { useState, useTransition } from "react";
import { jsx } from "react/jsx-runtime";
import { jsxToasts } from "@/lib/customToaster";

const PlaceOrderForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async () => {
    startTransition(async () => {
      try {
        const res = await createOrder();

        if (res?.redirectTo) {
          router.push(res.redirectTo);
        } else if (res?.success === false) {
          // Handle error case - you might want to show a toast or error message

          jsxToasts.errorWithIcon(
            "Order Creation Failed",
            res.message || "Something went wrong"
          );
        }
      } catch (error) {
        console.error("Error creating order:", error);
      }
    });
  };

  const PlaceOrderButton = () => {
    return (
      <Button
        asChild
        type="button"
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full button-primary">
        {isPending ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}
        Place Order
      </Button>
    );
  };

  return (
    <div className="w-full">
      <PlaceOrderButton />
    </div>
  );
};

export default PlaceOrderForm;
