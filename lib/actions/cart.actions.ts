"use server";
import { CartItem } from "@/types";
import { cookies } from "next/headers";
import { convertPrismaObjectToJSObject, formatError, round2 } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { Prisma } from "../generated/prisma";
import {
  getCachedData,
  invalidateCartCache,
  generateCacheKey,
  CACHE_CONFIG,
} from "../cache/redis";

// calculate total price of cart items
export const calculateCartTotal = async (items: CartItem[]) => {
  const itemsPrice = round2(
    items.reduce(
      (acc, item) => acc + Number(item.price) * Number(item.quantity),
      0
    )
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

export const addItemToCart = async (data: CartItem) => {
  try {
    // check for existing cart cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Session cart ID not found");

    // Get session and userID from cookies
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    //Get Cart
    const cart = await getMyCart();

    // parse and validate cart items
    const item = cartItemSchema.parse(data);

    // Find product from DB
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });

    // Check if product exists
    if (!product) throw new Error("Product not found");

    //create cart
    if (!cart) {
      // Calculate cart totals first
      const cartTotals = await calculateCartTotal([item]);

      // Create a new cart if it doesn't exist
      const newCartData = insertCartSchema.parse({
        userId: userId,
        items: [item],
        sessionCartId: sessionCartId,
        ...cartTotals,
      });

      // Save the new cart to database
      const createdCart = await prisma.cart.create({
        data: newCartData,
      });

      // Invalidate cart cache
      await invalidateCartCache(userId, sessionCartId);

      // Revalidate product page
      revalidatePath(`/product/${item.slug}`);
      return {
        success: true,
        message: `${product.name} added to cart successfully`,
      };
    } else {
      // If cart exists, check if item already exists in cart
      const existingItem = (cart.items as CartItem[]).find(
        (x) => x.productId === item.productId
      );

      if (existingItem) {
        // check item stock
        if (product.stock < existingItem.quantity + 1) {
          throw new Error(`Only ${product.stock} items available in stock`);
        }
        // Update existing item quantity
        existingItem.quantity += item.quantity;
      } else {
        // check item stock
        if (product.stock < item.quantity) {
          throw new Error(`Only ${product.stock} items available in stock`);
        }
        // Add new item to cart
        cart.items.push(item);
      }

      // save to database
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items,
          ...(await calculateCartTotal(cart.items as CartItem[])),
        },
      });

      // Invalidate cart cache
      await invalidateCartCache(userId, sessionCartId);

      //revalidate product page
      revalidatePath(`/product/${item.slug}`);

      return {
        success: true,
        message: `${product.name} ${
          existingItem ? "updated" : "added"
        } to cart successfully`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
};

export async function getMyCart() {
  try {
    // check for existing cart cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Session cart ID not found");

    // Get session and userID from cookies
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    // Try to get from cache first (short TTL for cart data)
    const cacheKey = userId
      ? generateCacheKey(CACHE_CONFIG.MY_CART.key, { userId })
      : generateCacheKey(CACHE_CONFIG.MY_CART.key, { sessionCartId });

    return getCachedData(
      cacheKey,
      async () => {
        //Get user cart from database
        const cart = await prisma.cart.findFirst({
          where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
        });

        if (!cart) {
          return null;
        }

        console.log("Cart found:", cart.id);
        // Convert decimal prices and return cart items
        return convertPrismaObjectToJSObject({
          ...cart,
          items: cart.items as CartItem[],
          itemsPrice: cart.itemsPrice.toString(),
          totalPrice: cart.totalPrice.toString(),
          shippingPrice: cart.shippingPrice.toString(),
          taxPrice: cart.taxPrice.toString(),
        });
      },
      CACHE_CONFIG.MY_CART.ttl
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const removeItemFromCart = async (productId: string) => {
  try {
    // Get session and userID from cookies
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Session cart ID not found");

    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    // Get Product
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found");

    // Get user cart
    const cart = await getMyCart();
    if (!cart) throw new Error("Cart not found");

    // Find item in cart
    const exist = cart.items.find(
      (item: CartItem) => item.productId === productId
    );
    if (!exist) throw new Error("Item not found in cart");

    //Check if only one item in cart
    if (exist.quantity === 1) {
      // Remove item from cart
      cart.items = cart.items.filter(
        (item: CartItem) => item.productId !== productId
      );
    } else {
      // Decrease item quantity
      cart.items.find(
        (item: CartItem) => item.productId === productId
      )!.quantity -= 1;
    }

    //update cart in database
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...(await calculateCartTotal(cart.items as CartItem[])),
      },
    });

    // Invalidate cart cache
    await invalidateCartCache(userId, sessionCartId);

    revalidatePath(`/product/${exist.slug}`);

    // Implementation for removing item from cart
    return {
      success: true,
      message: `${
        exist.quantity > 1 ? "Item quantity decreased" : "Item removed"
      } from cart successfully`,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: formatError(error),
    };
  }
};

// Clear entire cart with Redis cache invalidation
export const clearCart = async () => {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Session cart ID not found");

    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    // Get user cart
    const cart = await getMyCart();
    if (!cart) throw new Error("Cart not found");

    // Clear cart in database
    await prisma.cart.delete({
      where: { id: cart.id },
    });

    // Invalidate cart cache
    await invalidateCartCache(userId, sessionCartId);

    revalidatePath("/cart");

    return {
      success: true,
      message: "Cart cleared successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: formatError(error),
    };
  }
};

// Update cart item quantity with Redis cache invalidation
export const updateCartItemQuantity = async (
  productId: string,
  quantity: number
) => {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Session cart ID not found");

    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    // Get Product
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found");

    // Check stock availability
    if (product.stock < quantity) {
      throw new Error(`Only ${product.stock} items available in stock`);
    }

    // Get user cart
    const cart = await getMyCart();
    if (!cart) throw new Error("Cart not found");

    // Find item in cart
    const existingItem = cart.items.find(
      (item: CartItem) => item.productId === productId
    );
    if (!existingItem) throw new Error("Item not found in cart");

    // Update quantity
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items = cart.items.filter(
        (item: CartItem) => item.productId !== productId
      );
    } else {
      // Update quantity
      existingItem.quantity = quantity;
    }

    //update cart in database
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...(await calculateCartTotal(cart.items as CartItem[])),
      },
    });

    // Invalidate cart cache
    await invalidateCartCache(userId, sessionCartId);

    revalidatePath("/cart");
    revalidatePath(`/product/${existingItem.slug}`);

    return {
      success: true,
      message:
        quantity <= 0
          ? "Item removed from cart"
          : "Cart item quantity updated successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: formatError(error),
    };
  }
};

// Get cart count (for header display) with Redis cache
export async function getCartItemCount() {
  try {
    const cart = await getMyCart();
    if (!cart) return 0;

    return (cart.items as CartItem[]).reduce(
      (total, item) => total + item.quantity,
      0
    );
  } catch (error) {
    console.error("Error getting cart count:", error);
    return 0;
  }
}

// Merge guest cart with user cart when user logs in
export const mergeGuestCartWithUserCart = async (guestSessionId: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("User not authenticated");

    const userId = session.user.id as string;

    // Get guest cart
    const guestCart = await prisma.cart.findFirst({
      where: { sessionCartId: guestSessionId },
    });

    if (!guestCart) return { success: true, message: "No guest cart to merge" };

    // Get user cart
    const userCart = await prisma.cart.findFirst({
      where: { userId },
    });

    if (!userCart) {
      // If user has no cart, convert guest cart to user cart
      await prisma.cart.update({
        where: { id: guestCart.id },
        data: { userId, sessionCartId: null },
      });
    } else {
      // Merge guest cart items with user cart
      const userItems = userCart.items as CartItem[];
      const guestItems = guestCart.items as CartItem[];

      // Merge items (add quantities for existing products)
      const mergedItems = [...userItems];

      for (const guestItem of guestItems) {
        const existingIndex = mergedItems.findIndex(
          (item) => item.productId === guestItem.productId
        );

        if (existingIndex >= 0) {
          mergedItems[existingIndex].quantity += guestItem.quantity;
        } else {
          mergedItems.push(guestItem);
        }
      }

      // Update user cart with merged items
      await prisma.cart.update({
        where: { id: userCart.id },
        data: {
          items: mergedItems,
          ...(await calculateCartTotal(mergedItems)),
        },
      });

      // Delete guest cart
      await prisma.cart.delete({
        where: { id: guestCart.id },
      });
    }

    // Invalidate both caches
    await invalidateCartCache(userId, guestSessionId);

    return {
      success: true,
      message: "Cart merged successfully",
    };
  } catch (error) {
    console.error("Error merging carts:", error);
    return {
      success: false,
      message: formatError(error),
    };
  }
};
