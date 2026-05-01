"use server";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { calculateCartTotal, getMyCart } from "@/lib/cart-data";
import { mergeCartItems } from "@/lib/cart-utils";
import { CartItem } from "@/types";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { invalidateCartCache } from "../cache/redis";
import { Prisma } from "../generated/prisma";
import { formatError } from "../utils";
import { cartItemSchema, insertCartSchema } from "../validators";

const revalidateCartUi = (productSlug?: string) => {
  revalidatePath("/", "layout");
  revalidatePath("/cart");

  if (productSlug) {
    revalidatePath(`/product/${productSlug}`);
  }
};

export const addItemToCart = async (data: CartItem) => {
  try {
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;

    if (!userId && !sessionCartId) {
      throw new Error("Session cart ID not found");
    }

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

      revalidateCartUi(item.slug);
      return {
        success: true,
        message: `${product.name} added to cart successfully`,
      };
    } else {
      // If cart exists, check if item already exists in cart
      const existingItem = (cart.items as CartItem[]).find(
        (x) => x.productId === item.productId,
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

      revalidateCartUi(item.slug);

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

export const removeItemFromCart = async (productId: string) => {
  try {
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;

    if (!userId && !sessionCartId) throw new Error("Session cart ID not found");

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
      (item: CartItem) => item.productId === productId,
    );
    if (!exist) throw new Error("Item not found in cart");

    //Check if only one item in cart
    if (exist.quantity === 1) {
      // Remove item from cart
      cart.items = cart.items.filter(
        (item: CartItem) => item.productId !== productId,
      );
    } else {
      // Decrease item quantity
      cart.items.find(
        (item: CartItem) => item.productId === productId,
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

    revalidateCartUi(exist.slug);

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
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;

    if (!userId && !sessionCartId) throw new Error("Session cart ID not found");

    // Get user cart
    const cart = await getMyCart();
    if (!cart) throw new Error("Cart not found");

    // Clear cart in database
    await prisma.cart.delete({
      where: { id: cart.id },
    });

    // Invalidate cart cache
    await invalidateCartCache(userId, sessionCartId);

    revalidateCartUi();

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
  quantity: number,
) => {
  try {
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;

    if (!userId && !sessionCartId) throw new Error("Session cart ID not found");

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
      (item: CartItem) => item.productId === productId,
    );
    if (!existingItem) throw new Error("Item not found in cart");

    // Update quantity
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items = cart.items.filter(
        (item: CartItem) => item.productId !== productId,
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

    revalidateCartUi(existingItem.slug);

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
      const mergedItems = mergeCartItems(
        userCart.items as CartItem[],
        guestCart.items as CartItem[],
      );

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

    revalidateCartUi();

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
