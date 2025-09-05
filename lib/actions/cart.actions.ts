"use server";
import { CartItem } from "@/types";
import { cookies } from "next/headers";
import { convertPrismaObjectToJSObject, formatError, round2 } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { Prisma } from "../generated/prisma";

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
    // console.log("Product found ❌❌❌❌❌:", product);

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

      // Revalidate product page
      revalidatePath(`/product/${item.slug}`);
      return {
        success: true,
        message: `${product.name} added to cart successfully`,
      };
    } else {
      // If cart exists, check if item  already exists in cart
      const existingItem = (cart.items as CartItem[]).find(
        (x) => x.productId === item.productId
      );
      console.log("Existing item index:💥💥", existingItem);

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

    //Get user cart from database
    const cart = await prisma.cart.findFirst({
      where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
    });

    if (!cart) {
      //   console.log("No cart found for session: ❌❌❌❌", sessionCartId);
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
  } catch (error) {
    console.error(error);
  }
}

export const removeItemFromCart = async (productId: string) => {
  try {
    // Get session and userID from cookies
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Session cart ID not found");

    // Get Product
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found");

    // Get user cart
    const cart = await getMyCart();
    if (!cart) throw new Error("Cart not found");

    // Find item  in cart
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
