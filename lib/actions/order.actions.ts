"use server";

import { auth } from "@/auth";
import { CartItem, PaymentResult, SalesData, ShippingAddress } from "@/types";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { getMyCart } from "./cart.actions";
import { prisma } from "@/db/prisma";
import { getUserById } from "./user.actions";
import { insertOrderSchema } from "../validators";
import { DB_LATEST_SALES_TAKE, PAGE_SIZE } from "../constants";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const createOrder = async () => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const cart = await getMyCart();
    const userId = session.user.id;
    if (!userId) {
      throw new Error("User not found");
    }

    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Cart is empty",
        redirectTo: "/cart",
      };
    }

    if (!user.address) {
      return {
        success: false,
        message: "Shipping address not provided",
        redirectTo: "/shipping-address",
      };
    }
    if (!user.paymentMethod) {
      return {
        success: false,
        message: "Payment method not provided",
        redirectTo: "/payment-method",
      };
    }

    // Create the order
    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    // create a transaction to ensure atomicity
    const insertedOrder = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: order,
      });

      //create order items
      const orderItems = (cart.items as CartItem[]).map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        slug: item.slug,
        image: item.image,
      }));

      await Promise.all(
        orderItems.map(async (orderItem) => {
          await tx.orderItem.create({
            data: {
              ...orderItem,
              orderId: newOrder.id,
            },
          });
        })
      );

      // Clear the cart after successful order creation
      await tx.cart.deleteMany({
        where: { userId: user.id },
      });

      return newOrder;
    });

    return {
      success: true,
      message: "Order created successfully",
      redirectTo: `/order/${insertedOrder.id}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      message: "Failed to create order",
    };
  }
};

// Get order by ID
export const getOrderById = async (orderId: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId },
      include: {
        orderItems: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            paymentMethod: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  } catch (error) {
    if (isRedirectError(error)) throw error;
    throw new Error("Failed to retrieve order");
  }
};

// Update order to paid
export async function updateOrderToPaid({
  id,
  paymentResult,
}: {
  id: string;
  paymentResult?: PaymentResult;
}) {
  // Get order from database
  const order = await prisma.order.findFirst({
    where: {
      id,
    },
    include: {
      orderItems: true,
    },
  });

  if (!order) throw new Error("Order not found");

  if (order.isPaid) throw new Error("Order is already paid");

  // Transaction to update order and account for product stock
  await prisma.$transaction(async (tx) => {
    // Iterate over products and update stock
    for (const item of order.orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: -item.quantity } },
      });
    }

    // Set the order to paid
    await tx.order.update({
      where: { id },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      },
    });
  });

  // Get updated order after transaction
  const updatedOrder = await prisma.order.findFirst({
    where: { id },
    include: {
      orderItems: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!updatedOrder) throw new Error("Order not found");

  // sendPurchaseReceipt({
  //   order: {
  //     ...updatedOrder,
  //     shippingAddress: updatedOrder.shippingAddress as ShippingAddress,
  //     paymentResult: updatedOrder.paymentResult as PaymentResult,
  //   },
  // });
}

// Get user's orders
export async function getMyOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const session = await auth();

  if (!session) throw new Error("User is not authorized");

  const data = await prisma.order.findMany({
    where: { userId: session?.user?.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.order.count({
    where: { userId: session?.user?.id },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

//Get sales data and order summary for admin dashboard
export async function getOrderSummary() {
  try {
    //Get counts for each resources
    const ordersCount = await prisma.order.count();
    const productCounts = await prisma.product.count();
    const usersCount = await prisma.user.count();

    //calculate total sales
    const totalSales = await prisma.order.aggregate({
      _sum: {
        totalPrice: true,
      },
    });

    //get monthly sales data
    const salesRawData = await prisma.$queryRaw<
      Array<{ month: string; totalsales: string }>
    >`SELECT 
  to_char("createdAt", 'MM-YYYY') as month, 
  sum("totalPrice") as totalsales 
FROM "Order" 
GROUP BY to_char("createdAt", 'MM-YYYY')
ORDER BY to_char("createdAt", 'MM-YYYY')`;

    const salesData: SalesData = salesRawData.map((item) => ({
      month: item.month,
      totalSales: parseFloat(item.totalsales),
    }));

    // Latest sales data
    const latestSales = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
      take: DB_LATEST_SALES_TAKE,
    });

    return {
      ordersCount,
      productCounts,
      usersCount,
      totalSales,
      salesData,
      latestSales,
    };
  } catch (error) {
    console.error(error);
  }
}

// Get all orders for admin
export async function getAllOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const data = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
      orderItems: true,
    },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.order.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Delete order by ID
export async function deleteOrder(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    // Check if the order exists
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Delete the order
    await prisma.order.delete({
      where: { id },
    });
    revalidatePath("/admin/orders");
    return {
      success: true,
      message: "Order deleted successfully",
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      message: "Failed to delete order",
    };
  }
}

// Update COD to PAID status
export async function updateOrderToPaidCOD(id: string) {
  try {
    await updateOrderToPaid({ id });

    revalidatePath(`order/${id}`);

    return {
      success: true,
      message: "Order marked as COD PAID",
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      message: "Failed to update order",
    };
  }
}

// Update COD order to delevered
export async function updateOrderToDelivered(id: string) {
  try {
    const order = await prisma.order.findFirst({
      where: { id },
    });

    if (!order) {
      throw new Error("Order not found");
    }
    if (!order.isPaid) {
      throw new Error("Order is not paid");
    }

    if (order.isDelivered) {
      throw new Error("Order is already delivered");
    }

    // Update order status to delivered
    await prisma.order.update({
      where: { id },
      data: {
        isDelivered: true,
        deliveredAt: new Date(),
      },
    });

    revalidatePath(`order/${id}`);

    return {
      success: true,
      message: "Order marked as delivered",
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      message: "Failed to update order to delivered",
    };
  }
}
