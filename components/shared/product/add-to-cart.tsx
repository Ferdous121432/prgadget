"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus, Minus, Loader } from "lucide-react";
import { Cart, CartItem } from "@/types";
import { useTransition } from "react";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { jsxToasts } from "@/lib/customToaster";

const AddToCart = ({ cart, item }: { cart?: Cart; item: CartItem }) => {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const handleAddToCart = async () => {
    startTransition(async () => {
      const res = await addItemToCart(item);
      if (!res.success) {
        jsxToasts.errorWithIcon(
          "Failed to add to cart",
          res.message || "Something went wrong"
        );
        return;
      }
      jsxToasts.successWithIcon({
        title: "Added to cart!",
        message: res.message,
        href: "/cart",
        hrefTitle: "Go to Cart",
      });
    });
  };

  // Handle remove from cart
  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId);

      if (!res.success) {
        // Using JSX toast with custom div
        jsxToasts.errorWithIcon(
          "Failed to remove from cart",
          res.message || "Something went wrong"
        );
        return;
      }
      // Handle success remove from cart with JSX
      jsxToasts.successWithIcon("Removed from cart!", res.message);

      return;
    });
  };

  // Check if item is in cart
  const existItem =
    cart && cart.items.find((x) => x.productId === item.productId);

  return existItem ? (
    <div>
      <Button
        className="button-primary"
        type="button"
        variant="outline"
        onClick={handleRemoveFromCart}>
        {isPending ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Minus className="w-4 h-4" />
        )}
      </Button>
      <span className="px-2">{existItem.quantity}</span>
      <Button
        type="button"
        className="button-primary"
        variant="outline"
        onClick={handleAddToCart}>
        {isPending ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
      </Button>
    </div>
  ) : (
    <Button
      className="w-full button-primary"
      type="button"
      onClick={handleAddToCart}>
      {isPending ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        <Plus className="w-4 h-4" />
      )}
      Add To Cart
    </Button>
  );
};

export default AddToCart;
