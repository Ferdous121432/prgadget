"use client";

import { Button } from "@/components/ui/button";
import type { Cart, CartItem } from "@/types";
import { Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const PRODUCT_CART_TOAST_KEY = "product-cart-toast";

type CartMutationResponse = {
  success: boolean;
  message: string;
};

export type CartActionState = {
  success: boolean;
  message: string;
};

type CartActionButtonProps = {
  action: (
    state: CartActionState,
    payload: FormData,
  ) => Promise<CartActionState>;
  ariaLabel?: string;
  className: string;
  children: React.ReactNode;
};

const initialCartActionState: CartActionState = {
  success: false,
  message: "",
};

async function postCartMutation(payload: {
  action: "add" | "remove";
  item?: CartItem;
  productId?: string;
}): Promise<CartMutationResponse> {
  const response = await fetch("/api/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return (await response.json()) as CartMutationResponse;
}

export const CartActionButton = ({
  action,
  ariaLabel,
  className,
  children,
}: CartActionButtonProps) => {
  const [state, formAction, isPending] = useActionState(
    action,
    initialCartActionState,
  );
  const lastMessageRef = useRef("");

  useEffect(() => {
    if (!state.message || state.message === lastMessageRef.current) {
      return;
    }

    lastMessageRef.current = state.message;

    if (state.success) {
      toast.success(state.message);
      return;
    }

    toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction}>
      <button
        type="submit"
        className={className}
        aria-label={ariaLabel}
        disabled={isPending}>
        {children}
      </button>
    </form>
  );
};

const AddToCart = ({ cart, item }: { cart?: Cart; item: CartItem }) => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const queuedToast = window.sessionStorage.getItem(PRODUCT_CART_TOAST_KEY);

    if (!queuedToast) {
      return;
    }

    window.sessionStorage.removeItem(PRODUCT_CART_TOAST_KEY);
    toast.success(queuedToast);
  }, []);

  const handleCartAction = async (action: "add" | "remove") => {
    try {
      setIsPending(true);

      const result =
        action === "add"
          ? await postCartMutation({ action: "add", item })
          : await postCartMutation({
              action: "remove",
              productId: item.productId,
            });

      if (!result.success) {
        toast.error(result.message || "Unable to update cart");
        return;
      }

      const successMessage =
        result.message ||
        (action === "add" ? "Added to cart" : "Removed from cart");

      window.sessionStorage.setItem(PRODUCT_CART_TOAST_KEY, successMessage);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update cart",
      );
    } finally {
      setIsPending(false);
    }
  };

  const existItem =
    cart && cart.items.find((x) => x.productId === item.productId);

  return existItem ? (
    <div>
      <Button
        className="button-primary inline-block"
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={() => void handleCartAction("remove")}>
        <Minus className="w-4 h-4" />
      </Button>
      <span className="px-2">{existItem.quantity}</span>
      <Button
        type="button"
        className="button-primary inline-block"
        variant="outline"
        disabled={isPending}
        onClick={() => void handleCartAction("add")}>
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  ) : (
    <Button
      className="w-full button-primary"
      type="button"
      disabled={isPending}
      onClick={() => void handleCartAction("add")}>
      <Plus className="w-4 h-4" />
      Add To Cart
    </Button>
  );
};

export default AddToCart;
