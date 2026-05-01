"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Cart, CartItem } from "@/types";
import {
  ArrowRight,
  Loader,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

type CartMutationResponse = {
  success: boolean;
  message: string;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatCurrency(value: number | string) {
  return currencyFormatter.format(Number(value));
}

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

type FloatingCartSheetProps = {
  cart?: Cart | null;
  showLabel?: boolean;
};

const FloatingCartSheet = ({
  cart,
  showLabel = true,
}: FloatingCartSheetProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<"add" | "remove" | null>(
    null,
  );

  const items = cart?.items ?? [];
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  const handleUpdateItem = (item: CartItem, action: "add" | "remove") => {
    setActiveProductId(item.productId);
    setActiveAction(action);

    startTransition(async () => {
      try {
        const result =
          action === "add"
            ? await postCartMutation({ action: "add", item })
            : await postCartMutation({
                action: "remove",
                productId: item.productId,
              });

        if (!result.success) {
          toast.error(result.message || "Cart update failed");
          return;
        }

        toast.success(
          result.message ||
            (action === "add" ? "Added to cart" : "Removed from cart"),
        );

        router.refresh();
      } finally {
        setActiveProductId(null);
        setActiveAction(null);
      }
    });
  };

  const handleLinkNavigation = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size={showLabel ? "default" : "icon"}
          className="relative gap-2"
          aria-label={
            showLabel
              ? "Open cart"
              : `Open cart with ${itemCount} item${itemCount === 1 ? "" : "s"}`
          }>
          <ShoppingCart className="size-5" aria-hidden="true" />
          {showLabel ? <span>Cart</span> : null}
          {itemCount > 0 ? (
            <Badge
              variant="secondary"
              className={
                showLabel
                  ? "min-w-6 rounded-full px-2"
                  : "absolute -right-1 -top-1 min-w-5 rounded-full px-1.5 text-[10px]"
              }>
              {itemCount}
            </Badge>
          ) : null}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full lg:max-w-120">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div>
              <SheetTitle className="text-xl">Your Cart</SheetTitle>
              <SheetDescription>
                Review what&apos;s in your cart before heading to checkout.
              </SheetDescription>
            </div>
            <Badge variant="outline" className="rounded-full px-3 py-1">
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </Badge>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
            <div className="rounded-full border border-dashed p-4 text-muted-foreground">
              <ShoppingBag className="size-8" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground">
                Add a few items, then open this panel anytime to review them.
              </p>
            </div>
            <div className="grid w-full gap-2 sm:grid-cols-2">
              <Button
                variant="outline"
                onClick={() => handleLinkNavigation("/cart")}>
                View cart page
              </Button>
              <Button onClick={() => handleLinkNavigation("/")}>
                Continue shopping
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-4">
              {items.map((item, index) => {
                const isActiveItem = activeProductId === item.productId;

                return (
                  <div key={item.productId}>
                    <div className="flex gap-3 py-4">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="shrink-0 overflow-hidden rounded-md border">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={72}
                          height={72}
                          className="size-18 object-cover"
                        />
                      </Link>

                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              href={`/product/${item.slug}`}
                              onClick={() => setIsOpen(false)}
                              className="line-clamp-2 text-sm font-medium hover:underline">
                              {item.name}
                            </Link>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Unit price {formatCurrency(item.price)}
                            </p>
                          </div>

                          <div className="text-right text-sm font-semibold">
                            {formatCurrency(Number(item.price) * item.quantity)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="inline-flex items-center gap-2 rounded-full border px-2 py-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-full"
                              disabled={isPending}
                              onClick={() => handleUpdateItem(item, "remove")}>
                              {isPending &&
                              isActiveItem &&
                              activeAction === "remove" ? (
                                <Loader className="size-4 animate-spin" />
                              ) : (
                                <Minus className="size-4" />
                              )}
                            </Button>
                            <span className="min-w-5 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-full"
                              disabled={isPending}
                              onClick={() => handleUpdateItem(item, "add")}>
                              {isPending &&
                              isActiveItem &&
                              activeAction === "add" ? (
                                <Loader className="size-4 animate-spin" />
                              ) : (
                                <Plus className="size-4" />
                              )}
                            </Button>
                          </div>

                          <Button
                            variant="link"
                            className="h-auto px-0 text-sm"
                            onClick={() => handleLinkNavigation("/cart")}>
                            Edit in cart
                          </Button>
                        </div>
                      </div>
                    </div>
                    {index < items.length - 1 ? <Separator /> : null}
                  </div>
                );
              })}
            </div>

            <div className="border-t px-4 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-base font-semibold">
                  {formatCurrency(cart?.itemsPrice ?? "0")}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Shipping and tax are calculated on the checkout page.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Button
                  variant="outline"
                  onClick={() => handleLinkNavigation("/cart")}
                  className="w-full">
                  View full cart
                </Button>
                <Button
                  onClick={() => handleLinkNavigation("/shipping-address")}
                  className="w-full">
                  Checkout
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default FloatingCartSheet;
