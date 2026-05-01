"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  updateOrderFulfillmentStatus,
  updateOrderPaymentStatus,
} from "@/lib/actions/order.actions";
import { jsxToasts } from "@/lib/customToaster";
import {
  getAllowedOrderPaymentStatuses,
  getOrderFulfillmentStatusLabel,
  getOrderFulfillmentStatusTone,
  getOrderPaymentStatusLabel,
  getOrderPaymentStatusTone,
  isCashOnDeliveryPaymentMethod,
  isOrderPaymentCollectible,
  ORDER_FULFILLMENT_STATUSES,
  type OrderFulfillmentStatusValue,
  type OrderPaymentStatusValue,
} from "@/lib/order-status";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Order } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import StripePayment from "./stripe-payment";

const OrderDetailsTable = ({
  order,
  paypalClientId,
  isAdmin,
  stripeClientSecret,
}: {
  order: Omit<Order, "paymentResult">;
  paypalClientId: string;
  isAdmin: boolean;
  stripeClientSecret: string | null;
}) => {
  const {
    id,
    shippingAddress,
    orderItems,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    paymentMethod,
    paymentStatus,
    fulfillmentStatus,
    paidAt,
    deliveredAt,
  } = order;

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isCashOnDelivery = isCashOnDeliveryPaymentMethod(paymentMethod);
  const [nextPaymentStatus, setNextPaymentStatus] =
    useState<OrderPaymentStatusValue>(paymentStatus);
  const [nextFulfillmentStatus, setNextFulfillmentStatus] =
    useState<OrderFulfillmentStatusValue>(fulfillmentStatus);
  const allowedPaymentStatuses = getAllowedOrderPaymentStatuses({
    paymentMethod,
    currentStatus: paymentStatus,
  });

  const paymentStatusDetail =
    paymentStatus === "COD"
      ? "Cash will be collected from the customer on delivery"
      : paymentStatus === "PAID" && paidAt
        ? `Paid at ${formatDateTime(paidAt).dateTime}`
        : paymentStatus === "REFUNDED"
          ? "Money returned to the customer"
          : paymentStatus === "FAILED"
            ? "Transaction was rejected or could not be captured"
            : paymentMethod || "Payment method pending";

  const fulfillmentStatusDetail =
    fulfillmentStatus === "DELIVERED" && deliveredAt
      ? `Delivered at ${formatDateTime(deliveredAt).dateTime}`
      : fulfillmentStatus === "RETURNED"
        ? "This order was returned after delivery"
        : fulfillmentStatus === "CANCELLED"
          ? "This order was cancelled before completion"
          : "Track movement from placement to final delivery";

  const handlePaymentStatusSave = () => {
    startTransition(async () => {
      const res = await updateOrderPaymentStatus({
        id: order.id,
        status: nextPaymentStatus,
      });

      if (!res.success) {
        jsxToasts.errorWithIcon(
          "Failed to update payment status",
          res.message || "Something went wrong",
        );
        return;
      }

      jsxToasts.successWithIcon({
        title: "Payment status updated",
        message: res.message,
      });
      router.refresh();
    });
  };

  const handleFulfillmentStatusSave = () => {
    startTransition(async () => {
      const res = await updateOrderFulfillmentStatus({
        id: order.id,
        status: nextFulfillmentStatus,
      });

      if (!res.success) {
        jsxToasts.errorWithIcon(
          "Failed to update fulfillment status",
          res.message || "Something went wrong",
        );
        return;
      }

      jsxToasts.successWithIcon({
        title: "Fulfillment status updated",
        message: res.message,
      });
      router.refresh();
    });
  };

  return (
    <>
      <h1 className="py-4 text-2xl">Order {formatId(id)}</h1>
      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="col-span-2 space-4-y overlow-x-auto">
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Payment State</h2>
              <p className="mb-2">{paymentMethod}</p>
              <Badge variant={getOrderPaymentStatusTone(paymentStatus)}>
                {getOrderPaymentStatusLabel(paymentStatus)}
              </Badge>
              <p className="mt-3 text-sm text-muted-foreground">
                {paymentStatusDetail}
              </p>
            </CardContent>
          </Card>
          <Card className="my-2">
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Fulfillment State</h2>
              <p>{shippingAddress.fullName}</p>
              <p className="mb-2">
                {shippingAddress.streetAddress}, {shippingAddress.city}
                {shippingAddress.postalCode}, {shippingAddress.country}
              </p>
              <Badge variant={getOrderFulfillmentStatusTone(fulfillmentStatus)}>
                {getOrderFulfillmentStatusLabel(fulfillmentStatus)}
              </Badge>
              <p className="mt-3 text-sm text-muted-foreground">
                {fulfillmentStatusDetail}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Order Items</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item) => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link
                          href={`/product/${item.slug}`}
                          className="flex items-center">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
                          />
                          <span className="px-2">{item.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="px-2">{item.quantity}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        ${item.price}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="p-4 gap-4 space-y-4">
              <div className="flex justify-between">
                <div>Items</div>
                <div>{formatCurrency(itemsPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Tax</div>
                <div>{formatCurrency(taxPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Shipping</div>
                <div>{formatCurrency(shippingPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Total</div>
                <div>{formatCurrency(totalPrice)}</div>
              </div>

              {isOrderPaymentCollectible(paymentStatus) &&
                paymentMethod === "Stripe" &&
                stripeClientSecret && (
                  <StripePayment
                    priceInCents={Number(order.totalPrice) * 100}
                    orderId={order.id}
                    clientSecret={stripeClientSecret}
                  />
                )}

              {isAdmin && (
                <div className="space-y-4 border-t pt-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Update payment state</p>
                    <Select
                      value={nextPaymentStatus}
                      onValueChange={(value) =>
                        setNextPaymentStatus(value as OrderPaymentStatusValue)
                      }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment state" />
                      </SelectTrigger>
                      <SelectContent>
                        {allowedPaymentStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {getOrderPaymentStatusLabel(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      className="w-full"
                      variant="outline"
                      disabled={
                        isPending || nextPaymentStatus === paymentStatus
                      }
                      onClick={handlePaymentStatusSave}>
                      {isPending ? "Saving..." : "Save Payment State"}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Update order state</p>
                    <Select
                      value={nextFulfillmentStatus}
                      onValueChange={(value) =>
                        setNextFulfillmentStatus(
                          value as OrderFulfillmentStatusValue,
                        )
                      }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select order state" />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_FULFILLMENT_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {getOrderFulfillmentStatusLabel(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      className="w-full"
                      variant="outline"
                      disabled={
                        isPending || nextFulfillmentStatus === fulfillmentStatus
                      }
                      onClick={handleFulfillmentStatusSave}>
                      {isPending ? "Saving..." : "Save Order State"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsTable;
