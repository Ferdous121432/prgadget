import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { CartItem } from "@/types";
import { cookies } from "next/headers";
import { CACHE_CONFIG, generateCacheKey, getCachedData } from "./cache/redis";
import { convertPrismaObjectToJSObject, round2 } from "./utils";

export const calculateCartTotal = async (items: CartItem[]) => {
  const itemsPrice = round2(
    items.reduce(
      (acc, item) => acc + Number(item.price) * Number(item.quantity),
      0,
    ),
  );
  const shippingPrice = round2(itemsPrice > 100 ? 0 : 10);
  const taxPrice = round2(itemsPrice * 0.15);
  const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

export async function getMyCart() {
  try {
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;

    if (!userId && !sessionCartId) {
      return null;
    }

    const cacheKey = userId
      ? generateCacheKey(CACHE_CONFIG.MY_CART.key, { userId })
      : generateCacheKey(CACHE_CONFIG.MY_CART.key, { sessionCartId });

    return getCachedData(
      cacheKey,
      async () => {
        const cart = await prisma.cart.findFirst({
          where: userId ? { userId } : { sessionCartId },
        });

        if (!cart) {
          return null;
        }

        console.log("Cart found:", cart.id);

        return convertPrismaObjectToJSObject({
          ...cart,
          items: cart.items as CartItem[],
          itemsPrice: cart.itemsPrice.toString(),
          totalPrice: cart.totalPrice.toString(),
          shippingPrice: cart.shippingPrice.toString(),
          taxPrice: cart.taxPrice.toString(),
        });
      },
      CACHE_CONFIG.MY_CART.ttl,
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getCartItemCount() {
  try {
    const cart = await getMyCart();
    if (!cart) return 0;

    return (cart.items as CartItem[]).reduce(
      (total, item) => total + item.quantity,
      0,
    );
  } catch (error) {
    console.error("Error getting cart count:", error);
    return 0;
  }
}
