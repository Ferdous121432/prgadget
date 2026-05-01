"use server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { sendPurchaseReceipt } from "@/email";
import { getMyCart } from "@/lib/cart-data";
import {
  getAllowedOrderPaymentStatuses,
  getDefaultOrderPaymentStatus,
  isCashOnDeliveryPaymentMethod,
  ORDER_FULFILLMENT_STATUSES,
  ORDER_PAYMENT_STATUSES,
  OrderFulfillmentStatusValue,
  OrderPaymentStatusValue,
} from "@/lib/order-status";
import { resolveSelectedShippingAddress } from "@/lib/shipping-address";
import { CartItem, PaymentResult, SalesData, ShippingAddress } from "@/types";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import {
  DB_ADMIN_PRODUCT_TAKE,
  DB_LATEST_SALES_TAKE,
  PAGE_SIZE,
} from "../constants";
import { Prisma } from "../generated/prisma";
import { convertPrismaObjectToJSObject } from "../utils";
import { insertOrderSchema } from "../validators";
import { getUserById } from "./user.actions";

export type OrderDateRange = "today" | "7d" | "30d" | "lifetime";
export type AdminOrderSortField =
  | "buyer"
  | "date"
  | "total"
  | "paymentStatus"
  | "fulfillmentStatus";
export type AdminOrderSortOrder = "asc" | "desc";
export type AdminOrderPaymentStatusFilter = "all" | OrderPaymentStatusValue;
export type AdminOrderFulfillmentStatusFilter =
  | "all"
  | OrderFulfillmentStatusValue;

function getPaymentStatusUpdate(
  status: OrderPaymentStatusValue,
  order: {
    paidAt: Date | null;
  },
) {
  if (status === "PAID") {
    return {
      isPaid: true,
      paidAt: order.paidAt ?? new Date(),
    };
  }

  if (status === "REFUNDED") {
    return {
      isPaid: false,
      paidAt: order.paidAt,
    };
  }

  return {
    isPaid: false,
    paidAt: null,
  };
}

function getFulfillmentStatusUpdate(
  status: OrderFulfillmentStatusValue,
  order: {
    deliveredAt: Date | null;
  },
) {
  if (status === "DELIVERED") {
    return {
      isDelivered: true,
      deliveredAt: order.deliveredAt ?? new Date(),
    };
  }

  if (status === "RETURNED") {
    return {
      isDelivered: false,
      deliveredAt: order.deliveredAt,
    };
  }

  return {
    isDelivered: false,
    deliveredAt: null,
  };
}

function getDateFromForRange(range: OrderDateRange = "lifetime") {
  if (range === "lifetime") return undefined;

  const dateFrom = new Date();
  dateFrom.setHours(0, 0, 0, 0);

  if (range === "today") {
    return dateFrom;
  }

  if (range === "7d") {
    dateFrom.setDate(dateFrom.getDate() - 6);
    return dateFrom;
  }

  dateFrom.setDate(dateFrom.getDate() - 29);
  return dateFrom;
}

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
    const shippingAddress = resolveSelectedShippingAddress({
      selectedShippingAddress: user.selectedShippingAddress as never,
      shippingAddresses: user.shippingAddresses as never[],
      address: user.address,
    });

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Cart is empty",
        redirectTo: "/cart",
      };
    }

    if (!shippingAddress) {
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
      shippingAddress,
      paymentMethod: user.paymentMethod,
      paymentStatus: getDefaultOrderPaymentStatus(user.paymentMethod),
      fulfillmentStatus: "PLACED",
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    // create a transaction to ensure atomicity
    const insertedOrder = await prisma.$transaction(async (tx: any) => {
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
        }),
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

function getOrdersOrderBy({
  sortBy = "date",
  sortOrder = "desc",
}: {
  sortBy?: AdminOrderSortField;
  sortOrder?: AdminOrderSortOrder;
}): Prisma.OrderOrderByWithRelationInput[] {
  switch (sortBy) {
    case "buyer":
      return [{ user: { name: sortOrder } }, { createdAt: "desc" }];
    case "total":
      return [{ totalPrice: sortOrder }, { createdAt: "desc" }];
    case "paymentStatus":
      return [{ paymentStatus: sortOrder }, { createdAt: "desc" }];
    case "fulfillmentStatus":
      return [{ fulfillmentStatus: sortOrder }, { createdAt: "desc" }];
    case "date":
    default:
      return [{ createdAt: sortOrder }];
  }
}

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

  if (order.paymentStatus === "PAID") throw new Error("Order is already paid");

  // Transaction to update order and account for product stock
  await prisma.$transaction(async (tx: any) => {
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
        paymentStatus: "PAID",
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

  //TODO:
  sendPurchaseReceipt({
    order: {
      ...updatedOrder,
      shippingAddress: updatedOrder.shippingAddress as ShippingAddress,
      paymentResult: updatedOrder.paymentResult as PaymentResult,
    },
  });
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
export async function getOrderSummary(range: OrderDateRange = "lifetime") {
  try {
    const dateFrom = getDateFromForRange(range);
    const orderDateFilter: Prisma.OrderWhereInput = dateFrom
      ? { createdAt: { gte: dateFrom } }
      : {};
    const salesDateFilter = dateFrom
      ? Prisma.sql`WHERE "createdAt" >= ${dateFrom}`
      : Prisma.empty;
    const topProductsDateFilter = dateFrom
      ? Prisma.sql`WHERE o."createdAt" >= ${dateFrom}`
      : Prisma.empty;

    //Get counts for each resources
    const ordersCount = await prisma.order.count({
      where: orderDateFilter,
    });
    const productCounts = await prisma.product.count();
    const usersCount = await prisma.user.count();
    const paidOrdersCount = await prisma.order.count({
      where: { ...orderDateFilter, paymentStatus: "PAID" },
    });
    const unpaidOrdersCount = await prisma.order.count({
      where: {
        ...orderDateFilter,
        paymentStatus: { in: ["PENDING", "FAILED"] },
      },
    });
    const deliveredOrdersCount = await prisma.order.count({
      where: { ...orderDateFilter, fulfillmentStatus: "DELIVERED" },
    });
    const processingOrdersCount = await prisma.order.count({
      where: {
        ...orderDateFilter,
        fulfillmentStatus: { in: ["PLACED", "PROCESSING", "SHIPPED"] },
      },
    });

    //calculate total sales
    const totalSales = await prisma.order.aggregate({
      where: orderDateFilter,
      _sum: {
        totalPrice: true,
      },
    });

    //get monthly sales data
    const salesRawData = await prisma.$queryRaw<
      Array<{ month: string; totalsales: string }>
    >(
      Prisma.sql`SELECT 
        to_char("createdAt", 'MM-YYYY') as month,
        sum("totalPrice")::text as totalsales
      FROM "Order"
      ${salesDateFilter}
      GROUP BY to_char("createdAt", 'MM-YYYY')
      ORDER BY min("createdAt")`,
    );

    const salesData: SalesData = salesRawData.map(
      (item: { month: string; totalsales: string }) => ({
        month: item.month,
        totalSales: parseFloat(item.totalsales),
      }),
    );

    // Latest sales data
    const latestSales = await prisma.order.findMany({
      where: orderDateFilter,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
      take: DB_LATEST_SALES_TAKE,
    });

    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lte: 5 } },
      orderBy: [{ stock: "asc" }, { createdAt: "desc" }],
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        stock: true,
        MainCategory: { select: { name: true } },
      },
    });

    const topProducts = await prisma.$queryRaw<
      Array<{
        productId: string;
        name: string;
        slug: string;
        unitsSold: string;
        revenue: string;
      }>
    >`SELECT
        oi."productId" as "productId",
        oi.name,
        oi.slug,
        SUM(oi.quantity)::text AS "unitsSold",
        SUM(oi.price * oi.quantity)::text AS revenue
      FROM "OrderItem" oi
      INNER JOIN "Order" o ON o.id = oi."orderId"
      ${topProductsDateFilter}
      GROUP BY oi."productId", oi.name, oi.slug
      ORDER BY SUM(oi.quantity) DESC, SUM(oi.price * oi.quantity) DESC
      LIMIT 5`;

    const topCategories = await prisma.$queryRaw<
      Array<{
        category: string;
        productCount: string;
      }>
    >`SELECT
        mc.name AS category,
        COUNT(p.id)::text AS "productCount"
      FROM "Product" p
      INNER JOIN "MainCategory" mc ON mc.id = p."mainCategoryId"
      GROUP BY mc.name
      ORDER BY COUNT(p.id) DESC, mc.name ASC
      LIMIT 5`;

    return {
      ordersCount,
      productCounts,
      usersCount,
      paidOrdersCount,
      unpaidOrdersCount,
      deliveredOrdersCount,
      processingOrdersCount,
      totalSales,
      salesData,
      latestSales,
      lowStockProducts,
      topProducts,
      topCategories,
    };
  } catch (error) {
    console.error(error);
  }
}

// Get all orders for admin
export async function getAllOrders({
  limit = DB_ADMIN_PRODUCT_TAKE,
  page,
  query,
  range = "lifetime",
  sortBy = "date",
  sortOrder = "desc",
  paymentMethod,
  paymentStatus = "all",
  fulfillmentStatus = "all",
}: {
  limit?: number;
  page: number;
  query?: string;
  range?: OrderDateRange;
  sortBy?: AdminOrderSortField;
  sortOrder?: AdminOrderSortOrder;
  paymentMethod?: string;
  paymentStatus?: AdminOrderPaymentStatusFilter;
  fulfillmentStatus?: AdminOrderFulfillmentStatusFilter;
}) {
  // Helper function to check if string is a valid UUID
  const isValidUUID = (str: string) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };
  // Enhanced query filter for multiple words and fields
  const queryFilter: Prisma.OrderWhereInput =
    query && query !== "all"
      ? {
          OR: [
            // Search in user name (exact query)
            {
              user: {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
            // Search in user email
            {
              user: {
                email: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
            // Only search in ID if query is a valid UUID
            ...(isValidUUID(query)
              ? [
                  {
                    id: {
                      equals: query,
                    },
                  },
                ]
              : []),
            // Split query into words and search each word in user name
            ...query
              .split(" ")
              .filter((word) => word.length > 0)
              .map((word) => ({
                user: {
                  name: {
                    contains: word,
                    mode: "insensitive" as const,
                  },
                },
              })),
            // Split query into words and search each word in user email
            ...query
              .split(" ")
              .filter((word) => word.length > 0)
              .map((word) => ({
                user: {
                  email: {
                    contains: word,
                    mode: "insensitive" as const,
                  },
                },
              })),
          ],
        }
      : {};

  const dateFrom = getDateFromForRange(range);
  const where: Prisma.OrderWhereInput = {
    AND: [
      ...(dateFrom ? [{ createdAt: { gte: dateFrom } }] : []),
      ...(Object.keys(queryFilter).length > 0 ? [queryFilter] : []),
      ...(paymentMethod
        ? [
            {
              paymentMethod: {
                equals: paymentMethod,
              },
            },
          ]
        : []),
      ...(paymentStatus !== "all"
        ? [{ paymentStatus: { equals: paymentStatus } }]
        : []),
      ...(fulfillmentStatus !== "all"
        ? [{ fulfillmentStatus: { equals: fulfillmentStatus } }]
        : []),
    ],
  };

  const data = await prisma.order.findMany({
    where,
    orderBy: getOrdersOrderBy({ sortBy, sortOrder }),
    include: {
      user: { select: { name: true, email: true } },
      orderItems: true,
    },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.order.count({
    where,
  });

  return {
    data: convertPrismaObjectToJSObject(data),
    totalPages: Math.ceil(dataCount / limit),
  };
}

export async function getAdminOrderFilterOptions() {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    throw new Error("You are not authorized to view order filters");
  }

  const paymentMethods = await prisma.order.findMany({
    distinct: ["paymentMethod"],
    orderBy: { paymentMethod: "asc" },
    select: {
      paymentMethod: true,
    },
  });

  return {
    paymentMethods: paymentMethods
      .map((item) => item.paymentMethod)
      .filter(Boolean),
  };
}

export async function updateOrderPaymentStatus({
  id,
  status,
}: {
  id: string;
  status: OrderPaymentStatusValue;
}) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return {
        success: false,
        message: "Only admins can update payment status",
      };
    }

    const order = await prisma.order.findFirst({
      where: { id },
      select: {
        id: true,
        paymentMethod: true,
        paymentStatus: true,
        paidAt: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const normalizedStatus = ORDER_PAYMENT_STATUSES.includes(status)
      ? status
      : "PENDING";

    if (
      normalizedStatus === "COD" &&
      !isCashOnDeliveryPaymentMethod(order.paymentMethod)
    ) {
      return {
        success: false,
        message: "COD payment state is only valid for cash on delivery orders",
      };
    }

    const allowedStatuses = getAllowedOrderPaymentStatuses({
      paymentMethod: order.paymentMethod,
      currentStatus: order.paymentStatus,
    });

    if (!allowedStatuses.includes(normalizedStatus)) {
      return {
        success: false,
        message: `Payment state cannot move from ${order.paymentStatus.toLowerCase()} to ${normalizedStatus.toLowerCase()} for this order`,
      };
    }

    const legacyUpdate = getPaymentStatusUpdate(normalizedStatus, order);

    await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: normalizedStatus,
        ...legacyUpdate,
      },
    });

    revalidatePath(`/order/${id}`);
    revalidatePath("/admin/orders");
    revalidatePath("/admin/orders/all-orders");

    return {
      success: true,
      message: `Payment status updated to ${normalizedStatus.toLowerCase()}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update payment status",
    };
  }
}

export async function updateOrderFulfillmentStatus({
  id,
  status,
}: {
  id: string;
  status: OrderFulfillmentStatusValue;
}) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return {
        success: false,
        message: "Only admins can update fulfillment status",
      };
    }

    const order = await prisma.order.findFirst({
      where: { id },
      select: {
        id: true,
        deliveredAt: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const normalizedStatus = ORDER_FULFILLMENT_STATUSES.includes(status)
      ? status
      : "PLACED";
    const legacyUpdate = getFulfillmentStatusUpdate(normalizedStatus, order);

    await prisma.order.update({
      where: { id },
      data: {
        fulfillmentStatus: normalizedStatus,
        ...legacyUpdate,
      },
    });

    revalidatePath(`/order/${id}`);
    revalidatePath("/admin/orders");
    revalidatePath("/admin/orders/all-orders");

    return {
      success: true,
      message: `Fulfillment status updated to ${normalizedStatus.toLowerCase()}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update fulfillment status",
    };
  }
}

export async function getDeletedOrders({
  limit = DB_ADMIN_PRODUCT_TAKE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query?: string;
}) {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    throw new Error("You are not authorized to view deleted orders");
  }

  const isValidUUID = (value: string) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  };

  const words = query
    ? query
        .split(" ")
        .map((word) => word.trim())
        .filter(Boolean)
    : [];

  const where: Prisma.DeletedOrderWhereInput =
    query && query !== "all"
      ? {
          OR: [
            {
              userName: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              userEmail: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              deletedByUserName: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              deletedByUserEmail: {
                contains: query,
                mode: "insensitive",
              },
            },
            ...(isValidUUID(query)
              ? [
                  {
                    id: {
                      equals: query,
                    },
                  },
                  {
                    originalOrderId: {
                      equals: query,
                    },
                  },
                ]
              : []),
            ...words.map((word) => ({
              OR: [
                {
                  userName: {
                    contains: word,
                    mode: "insensitive" as const,
                  },
                },
                {
                  userEmail: {
                    contains: word,
                    mode: "insensitive" as const,
                  },
                },
                {
                  deletedByUserName: {
                    contains: word,
                    mode: "insensitive" as const,
                  },
                },
                {
                  deletedByUserEmail: {
                    contains: word,
                    mode: "insensitive" as const,
                  },
                },
              ],
            })),
          ],
        }
      : {};

  const data = await prisma.deletedOrder.findMany({
    where,
    orderBy: { deletedAt: "desc" },
    include: {
      _count: {
        select: {
          orderItems: true,
        },
      },
    },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.deletedOrder.count({
    where,
  });

  return {
    data: convertPrismaObjectToJSObject(data),
    totalPages: Math.ceil(dataCount / limit),
    totalCount: dataCount,
  };
}

// Delete order by ID
export async function deleteOrder(id: string) {
  try {
    const session = await auth();
    const adminUserId = session?.user?.id;

    if (!adminUserId) {
      throw new Error("User not authenticated");
    }

    if (session.user.role !== "admin") {
      return {
        success: false,
        message: "Only admins can delete orders",
      };
    }

    // Check if the order exists
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    await prisma.$transaction(async (tx) => {
      await tx.deletedOrder.create({
        data: {
          originalOrderId: order.id,
          userId: order.userId,
          userName: order.user?.name ?? null,
          userEmail: order.user?.email ?? null,
          shippingAddress: order.shippingAddress as Prisma.InputJsonValue,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          fulfillmentStatus: order.fulfillmentStatus,
          ...(order.paymentResult !== null
            ? {
                paymentResult: order.paymentResult as Prisma.InputJsonValue,
              }
            : {}),
          itemsPrice: order.itemsPrice,
          totalPrice: order.totalPrice,
          shippingPrice: order.shippingPrice,
          taxPrice: order.taxPrice,
          isPaid: order.isPaid,
          paidAt: order.paidAt,
          isDelivered: order.isDelivered,
          deliveredAt: order.deliveredAt,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          deletedByUserId: adminUserId,
          deletedByUserName: session.user.name ?? null,
          deletedByUserEmail: session.user.email ?? null,
          orderItems: {
            create: order.orderItems.map((item) => ({
              originalOrderId: item.orderId,
              productId: item.productId,
              name: item.name,
              slug: item.slug,
              image: item.image,
              price: item.price,
              quantity: item.quantity,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            })),
          },
        },
      });

      await tx.order.delete({
        where: { id },
      });
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin/orders/deleted");
    return {
      success: true,
      message: "Order moved to deleted orders archive",
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
    const res = await updateOrderPaymentStatus({ id, status: "PAID" });

    if (!res.success) {
      throw new Error(res.message);
    }

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
    const res = await updateOrderFulfillmentStatus({
      id,
      status: "DELIVERED",
    });

    if (!res.success) {
      throw new Error(res.message);
    }

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
