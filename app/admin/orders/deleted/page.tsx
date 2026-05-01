import Pagination from "@/components/shared/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDeletedOrders } from "@/lib/actions/order.actions";
import { requireAdmin } from "@/lib/auth-guard";
import {
  getOrderFulfillmentStatusLabel,
  getOrderFulfillmentStatusTone,
  getOrderPaymentStatusLabel,
  getOrderPaymentStatusTone,
} from "@/lib/order-status";
import {
  formatCurrency,
  formatDateTime,
  formatId,
  formatNumber,
} from "@/lib/utils";
import { Archive, ArrowLeft, ShieldAlert } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Deleted Orders",
};

export default async function AdminDeletedOrdersPage(props: {
  searchParams: Promise<{ page?: string; query?: string }>;
}) {
  await requireAdmin();

  const { page = "1", query = "" } = await props.searchParams;
  const archivedOrders = await getDeletedOrders({
    page: Number(page) || 1,
    query: query || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="h2-bold">Deleted Orders Archive</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Orders removed from the live queue are preserved here as immutable
            admin history. Archived orders cannot be deleted from the website.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/orders">
              <ArrowLeft className="size-4" />
              Back to active orders
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full max-w-xl space-y-3">
            <form
              action="/admin/orders/deleted"
              method="GET"
              className="flex gap-2">
              <Input
                type="search"
                name="query"
                defaultValue={query}
                placeholder="Search by buyer, deleter, or order ID"
              />
              <Button type="submit">Search</Button>
            </form>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                <Archive className="mr-1 size-3" />
                {formatNumber(archivedOrders.totalCount)} archived orders
              </Badge>
              <Badge variant="outline">
                {formatNumber(archivedOrders.totalPages)} pages
              </Badge>
              <Badge variant="secondary">
                <ShieldAlert className="mr-1 size-3" />
                Admin-only records
              </Badge>
            </div>
          </div>

          {query && (
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/orders/deleted">Clear filter</Link>
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Archived order history</CardTitle>
          <CardDescription>
            A permanent website-visible archive of orders removed by admins from
            the live commerce queue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ARCHIVE ID</TableHead>
                  <TableHead>ORIGINAL ORDER</TableHead>
                  <TableHead>BUYER</TableHead>
                  <TableHead>DELETED BY</TableHead>
                  <TableHead>ORDERED</TableHead>
                  <TableHead>DELETED</TableHead>
                  <TableHead>TOTAL</TableHead>
                  <TableHead>PAYMENT STATUS</TableHead>
                  <TableHead>ORDER STATUS</TableHead>
                  <TableHead>ITEMS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archivedOrders.data.length > 0 ? (
                  archivedOrders.data.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell>{formatId(order.id)}</TableCell>
                      <TableCell>{formatId(order.originalOrderId)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {order.userName || "Deleted User"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.userEmail || "No email"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {order.deletedByUserName || "Admin"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.deletedByUserEmail || "No email"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDateTime(new Date(order.createdAt)).dateTime}
                      </TableCell>
                      <TableCell>
                        {formatDateTime(new Date(order.deletedAt)).dateTime}
                      </TableCell>
                      <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getOrderPaymentStatusTone(
                            order.paymentStatus,
                          )}>
                          {getOrderPaymentStatusLabel(order.paymentStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getOrderFulfillmentStatusTone(
                            order.fulfillmentStatus,
                          )}>
                          {getOrderFulfillmentStatusLabel(
                            order.fulfillmentStatus,
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatNumber(order._count?.orderItems ?? 0)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="py-10 text-center text-muted-foreground">
                      No deleted orders matched the current filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {archivedOrders.totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                page={Number(page) || 1}
                totalPages={archivedOrders.totalPages}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
