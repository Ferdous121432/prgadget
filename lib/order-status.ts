export const ORDER_PAYMENT_STATUSES = [
  "COD",
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;

export const ORDER_FULFILLMENT_STATUSES = [
  "PLACED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
] as const;

export type OrderPaymentStatusValue = (typeof ORDER_PAYMENT_STATUSES)[number];
export type OrderFulfillmentStatusValue =
  (typeof ORDER_FULFILLMENT_STATUSES)[number];
export type OrderStatusBadgeTone =
  | "default"
  | "secondary"
  | "outline"
  | "destructive";

export function isCashOnDeliveryPaymentMethod(paymentMethod?: string | null) {
  return paymentMethod === "CashOnDelivery";
}

export function getDefaultOrderPaymentStatus(
  paymentMethod?: string | null,
): OrderPaymentStatusValue {
  return isCashOnDeliveryPaymentMethod(paymentMethod) ? "COD" : "PENDING";
}

export function getAllowedOrderPaymentStatuses({
  paymentMethod,
  currentStatus,
}: {
  paymentMethod?: string | null;
  currentStatus?: string | null;
}): OrderPaymentStatusValue[] {
  const normalizedStatus = normalizeOrderPaymentStatus(currentStatus);

  if (!isCashOnDeliveryPaymentMethod(paymentMethod)) {
    return ORDER_PAYMENT_STATUSES.filter((status) => status !== "COD");
  }

  switch (normalizedStatus) {
    case "COD":
      return ["COD", "PAID"];
    case "PAID":
      return ["PAID", "REFUNDED"];
    case "REFUNDED":
      return ["REFUNDED"];
    default:
      return [normalizedStatus];
  }
}

export function normalizeOrderPaymentStatus(
  status?: string | null,
): OrderPaymentStatusValue {
  return ORDER_PAYMENT_STATUSES.includes(status as OrderPaymentStatusValue)
    ? (status as OrderPaymentStatusValue)
    : "PENDING";
}

export function normalizeOrderFulfillmentStatus(
  status?: string | null,
): OrderFulfillmentStatusValue {
  return ORDER_FULFILLMENT_STATUSES.includes(
    status as OrderFulfillmentStatusValue,
  )
    ? (status as OrderFulfillmentStatusValue)
    : "PLACED";
}

export function getOrderPaymentStatusLabel(status?: string | null) {
  switch (normalizeOrderPaymentStatus(status)) {
    case "COD":
      return "COD";
    case "PAID":
      return "Paid";
    case "FAILED":
      return "Failed";
    case "REFUNDED":
      return "Refunded";
    case "PENDING":
    default:
      return "Pending";
  }
}

export function getOrderFulfillmentStatusLabel(status?: string | null) {
  switch (normalizeOrderFulfillmentStatus(status)) {
    case "PROCESSING":
      return "Processing";
    case "SHIPPED":
      return "Shipped / In Transit";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    case "RETURNED":
      return "Returned";
    case "PLACED":
    default:
      return "Placed";
  }
}

export function getOrderPaymentStatusTone(
  status?: string | null,
): OrderStatusBadgeTone {
  switch (normalizeOrderPaymentStatus(status)) {
    case "COD":
      return "default";
    case "PAID":
      return "secondary";
    case "FAILED":
      return "destructive";
    case "REFUNDED":
      return "default";
    case "PENDING":
    default:
      return "outline";
  }
}

export function getOrderFulfillmentStatusTone(
  status?: string | null,
): OrderStatusBadgeTone {
  switch (normalizeOrderFulfillmentStatus(status)) {
    case "DELIVERED":
      return "secondary";
    case "PROCESSING":
    case "SHIPPED":
      return "default";
    case "CANCELLED":
    case "RETURNED":
      return "destructive";
    case "PLACED":
    default:
      return "outline";
  }
}

export function isOrderPaymentCollectible(status?: string | null) {
  const normalizedStatus = normalizeOrderPaymentStatus(status);
  return normalizedStatus === "PENDING" || normalizedStatus === "FAILED";
}

export function isOrderFulfillmentActive(status?: string | null) {
  const normalizedStatus = normalizeOrderFulfillmentStatus(status);
  return (
    normalizedStatus === "PLACED" ||
    normalizedStatus === "PROCESSING" ||
    normalizedStatus === "SHIPPED"
  );
}
