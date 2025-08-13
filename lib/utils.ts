import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import qs from "query-string";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// convert prisma objest to regular js object
export function convertPrismaObjectToJSObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

// Format errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatError(error: any) {
  if (error.name === "ZodError") {
    // Handle Zod error
    const fieldErrors = error.issues?.map((issue: any) => issue.message) || [];

    return fieldErrors.join(". ");
  } else if (
    error.name === "PrismaClientKnownRequestError" &&
    error.code === "P2002"
  ) {
    // Handle Prisma error
    const field = error.meta?.target ? error.meta.target[0] : "Field";
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else {
    // Handle other errors
    return typeof error.message === "string"
      ? error.message
      : JSON.stringify(error.message);
  }
}

// Round number to 2 decimal places
export function round2(value: number | string) {
  if (typeof value === "number") {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  } else if (typeof value === "string") {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  } else {
    throw new Error("Value is not a number or string");
  }
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
  minimumFractionDigits: 2,
});

// Format currency using the formatter above to Number
export function formatCurrency(amount: number | string | null) {
  if (typeof amount === "number") {
    return CURRENCY_FORMATTER.format(amount);
  } else if (typeof amount === "string") {
    return CURRENCY_FORMATTER.format(Number(amount));
  } else {
    return "NaN";
  }
}

// Format Number
const NUMBER_FORMATTER = new Intl.NumberFormat("en-US");

export function formatNumber(number: number) {
  return NUMBER_FORMATTER.format(number);
}

// Shorten UUID
export function formatId(id: string) {
  return `..${id.substring(id.length - 6)}`;
}

// Format date and times
export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "en-US",
    dateTimeOptions
  );
  const formattedDate: string = new Date(dateString).toLocaleString(
    "en-US",
    dateOptions
  );
  const formattedTime: string = new Date(dateString).toLocaleString(
    "en-US",
    timeOptions
  );
  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

// Form the pagination links
export function formUrlQuery({
  params,
  key,
  value,
}: {
  params: string;
  key: string;
  value: string | null;
}) {
  const query = qs.parse(params);

  query[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query,
    },
    {
      skipNull: true,
    }
  );
}

// Form the pagination links with multiple updates
// Form the pagination links
//updates: {
//   [urlParamName || "page"]: pageValue.toString(),
//   ["test"]: "testfff",
// },
export function formUrlQueryMultiple({
  params,
  updates,
}: {
  params: string;
  updates: Record<string, string | null>;
}) {
  const query = qs.parse(params);

  Object.entries(updates).forEach(([key, value]) => {
    query[key] = value;
  });

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query,
    },
    {
      skipNull: true,
    }
  );
}

// Serialize order data for client components, handling Decimal objects and removing symbol properties
export function serializeOrderForClient(order: any) {
  return {
    id: order.id,
    userId: order.userId,
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    itemsPrice: order.itemsPrice?.toString(),
    totalPrice: order.totalPrice?.toString(),
    shippingPrice: order.shippingPrice?.toString(),
    taxPrice: order.taxPrice?.toString(),
    isPaid: order.isPaid,
    paidAt: order.paidAt,
    isDelivered: order.isDelivered,
    deliveredAt: order.deliveredAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    orderItems:
      order.orderItems?.map((item: any) => ({
        orderId: item.orderId,
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        image: item.image,
        price: item.price?.toString(),
        quantity: item.quantity,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })) || [],
    user: {
      name: order.user?.name || "",
      email: order.user?.email || "",
    },
  };
}

// Solve Decimal serialization issue in Next.js
export function SerializeGetMyOrder(response: any) {
  return {
    data: Array.isArray(response.data)
      ? response.data.map((order: any) => ({
          id: order.id,
          userId: order.userId,
          shippingAddress: order.shippingAddress,
          paymentMethod: order.paymentMethod,
          paymentResult: order.paymentResult,
          itemsPrice: order.itemsPrice?.toString(),
          totalPrice: order.totalPrice?.toString(),
          shippingPrice: order.shippingPrice?.toString(),
          taxPrice: order.taxPrice?.toString(),
          isPaid: order.isPaid,
          paidAt: order.paidAt,
          isDelivered: order.isDelivered,
          deliveredAt: order.deliveredAt,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        }))
      : [],
    totalPages: response.totalPages,
  };
}
// Serialize dashboard stats for client components, handling Decimal objects and nested structures
export function serializeDashboardStats(response: any) {
  return {
    ordersCount: response.ordersCount,
    productCounts: response.productCounts,
    usersCount: response.usersCount,
    totalSales: {
      _sum: {
        totalPrice: response.totalSales?._sum?.totalPrice?.toString() ?? "0",
      },
    },
    salesData: Array.isArray(response.salesData)
      ? response.salesData.map((item: any) => ({
          month: item.month,
          totalSales:
            typeof item.totalSales === "object" && item.totalSales !== null
              ? Number(item.totalSales)
              : item.totalSales,
        }))
      : [],
    latestSales: Array.isArray(response.latestSales)
      ? response.latestSales.map((order: any) => ({
          id: order.id,
          userId: order.userId,
          shippingAddress: order.shippingAddress,
          paymentMethod: order.paymentMethod,
          paymentResult: order.paymentResult,
          itemsPrice: order.itemsPrice?.toString(),
          totalPrice: order.totalPrice?.toString(),
          shippingPrice: order.shippingPrice?.toString(),
          taxPrice: order.taxPrice?.toString(),
          isPaid: order.isPaid,
          paidAt: order.paidAt,
          isDelivered: order.isDelivered,
          deliveredAt: order.deliveredAt,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          user: {
            name: order.user?.name || "",
            email: order.user?.email || "",
          },
        }))
      : [],
  };
}

// Format number with decimal places
export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`;
}
