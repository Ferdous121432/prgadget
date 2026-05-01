import Pagination from "@/components/shared/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMyOrders } from "@/lib/actions/order.actions";
import { requireAuth } from "@/lib/auth-guard";
import {
  getOrderFulfillmentStatusLabel,
  getOrderFulfillmentStatusTone,
  getOrderPaymentStatusLabel,
  getOrderPaymentStatusTone,
  isOrderFulfillmentActive,
} from "@/lib/order-status";
import {
  formatCurrency,
  formatDateTime,
  formatId,
  SerializeGetMyOrder,
} from "@/lib/utils";
import { Order } from "@/types";
import {
  ArrowRight,
  CreditCard,
  PackageCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Orders",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getPaymentStatusDetail(order: Order) {
  if (order.paymentStatus === "COD") {
    return "Cash will be collected when the order is delivered";
  }

  if (order.paymentStatus === "PAID" && order.paidAt) {
    return formatDateTime(order.paidAt).dateTime;
  }

  if (order.paymentStatus === "REFUNDED") {
    return "Refund sent back to your payment source";
  }

  if (order.paymentStatus === "FAILED") {
    return "The payment gateway could not capture this payment";
  }

  return order.paymentMethod || "Payment method pending";
}

function getFulfillmentStatusDetail(order: Order) {
  if (order.fulfillmentStatus === "DELIVERED" && order.deliveredAt) {
    return formatDateTime(order.deliveredAt).dateTime;
  }

  if (order.fulfillmentStatus === "RETURNED") {
    return "Returned after delivery";
  }

  if (order.fulfillmentStatus === "CANCELLED") {
    return "This order is no longer being processed";
  }

  return "Track this order from placement to delivery";
}

const OrdersPage = async (props: {
  searchParams: Promise<{ page: string }>;
}) => {
  const { page } = await props.searchParams;
  const callbackUrl = `/user/orders${page ? `?page=${page}` : ""}`;

  await requireAuth(callbackUrl);

  const rawOrders = await getMyOrders({
    page: Number(page) || 1,
  });

  const orders = SerializeGetMyOrder(rawOrders);
  const paidOrdersCount = orders.data.filter(
    (order: Order) => order.paymentStatus === "PAID",
  ).length;
  const deliveredOrdersCount = orders.data.filter(
    (order: Order) => order.fulfillmentStatus === "DELIVERED",
  ).length;
  const activeOrdersCount = orders.data.filter((order: Order) =>
    isOrderFulfillmentActive(order.fulfillmentStatus),
  ).length;
  const totalSpent = orders.data.reduce(
    (sum: number, order: Order) => sum + Number(order.totalPrice || 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1 flex-1">
          <h2 className="h2-bold">My Orders</h2>
          <p className="text-sm text-muted-foreground">
            Track recent purchases, the money state of each order, and the live
            fulfillment stage from one place.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">
            Continue shopping
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ShoppingBag className="size-4" />
              Orders on this page
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{orders.data.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CreditCard className="size-4" />
              Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{paidOrdersCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <PackageCheck className="size-4" />
              Delivered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{deliveredOrdersCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Truck className="size-4" />
              Active orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{activeOrdersCount}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatCurrency(totalSpent)} total on this page
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.data.length > 0 ? (
                  orders.data.map((order: Order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {formatId(order.id)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order.paymentMethod || "Payment method pending"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>
                            {formatDateTime(new Date(order.createdAt)).dateOnly}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDateTime(new Date(order.createdAt)).timeOnly}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.totalPrice)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Badge
                            variant={getOrderPaymentStatusTone(
                              order.paymentStatus,
                            )}>
                            {getOrderPaymentStatusLabel(order.paymentStatus)}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {getPaymentStatusDetail(order)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Badge
                            variant={getOrderFulfillmentStatusTone(
                              order.fulfillmentStatus,
                            )}>
                            {getOrderFulfillmentStatusLabel(
                              order.fulfillmentStatus,
                            )}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {getFulfillmentStatusDetail(order)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/order/${order.id}`}>View details</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <div className="space-y-2">
                        <p className="text-base font-medium">
                          No orders found yet
                        </p>
                        <p className="text-sm text-muted-foreground">
                          When you place your first order, it will appear here
                          with financial and fulfillment tracking.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {orders.totalPages > 1 && (
        <div className="pt-2">
          <Pagination
            page={Number(page) || 1}
            totalPages={orders?.totalPages}
          />
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
