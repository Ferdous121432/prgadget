import DeleteDialog from "@/components/shared/DeteleDialog";
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
import {
  deleteOrder,
  getAdminOrderFilterOptions,
  getAllOrders,
  type AdminOrderFulfillmentStatusFilter,
  type AdminOrderPaymentStatusFilter,
  type AdminOrderSortField,
  type AdminOrderSortOrder,
} from "@/lib/actions/order.actions";
import { requireAdmin } from "@/lib/auth-guard";
import {
  getOrderFulfillmentStatusLabel,
  getOrderFulfillmentStatusTone,
  getOrderPaymentStatusLabel,
  getOrderPaymentStatusTone,
  ORDER_FULFILLMENT_STATUSES,
  ORDER_PAYMENT_STATUSES,
  type OrderFulfillmentStatusValue,
  type OrderPaymentStatusValue,
} from "@/lib/order-status";
import {
  formatCurrency,
  formatDateTime,
  formatId,
  formatNumber,
} from "@/lib/utils";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "All Orders",
};

const SORT_FIELDS: AdminOrderSortField[] = [
  "buyer",
  "date",
  "total",
  "paymentStatus",
  "fulfillmentStatus",
];
const SORT_ORDERS: AdminOrderSortOrder[] = ["asc", "desc"];
const PAYMENT_STATUS_FILTERS: AdminOrderPaymentStatusFilter[] = [
  "all",
  ...ORDER_PAYMENT_STATUSES,
];
const FULFILLMENT_STATUS_FILTERS: AdminOrderFulfillmentStatusFilter[] = [
  "all",
  ...ORDER_FULFILLMENT_STATUSES,
];

function normalizeSortField(value?: string): AdminOrderSortField {
  return SORT_FIELDS.includes(value as AdminOrderSortField)
    ? (value as AdminOrderSortField)
    : "date";
}

function normalizeSortOrder(value?: string): AdminOrderSortOrder {
  return SORT_ORDERS.includes(value as AdminOrderSortOrder)
    ? (value as AdminOrderSortOrder)
    : "desc";
}

function normalizePaymentStatusFilter(
  value?: string,
): AdminOrderPaymentStatusFilter {
  return PAYMENT_STATUS_FILTERS.includes(value as AdminOrderPaymentStatusFilter)
    ? (value as AdminOrderPaymentStatusFilter)
    : "all";
}

function normalizeFulfillmentStatusFilter(
  value?: string,
): AdminOrderFulfillmentStatusFilter {
  return FULFILLMENT_STATUS_FILTERS.includes(
    value as AdminOrderFulfillmentStatusFilter,
  )
    ? (value as AdminOrderFulfillmentStatusFilter)
    : "all";
}

function getDefaultSortOrder(field: AdminOrderSortField): AdminOrderSortOrder {
  return field === "buyer" ? "asc" : "desc";
}

function buildAllOrdersHref({
  query,
  sortBy,
  sortOrder,
  paymentMethod,
  paymentStatus,
  fulfillmentStatus,
}: {
  query?: string;
  sortBy?: AdminOrderSortField;
  sortOrder?: AdminOrderSortOrder;
  paymentMethod?: string;
  paymentStatus?: AdminOrderPaymentStatusFilter;
  fulfillmentStatus?: AdminOrderFulfillmentStatusFilter;
}) {
  const params = new URLSearchParams();

  if (query) {
    params.set("query", query);
  }

  if (sortBy && sortBy !== "date") {
    params.set("sortBy", sortBy);
  }

  if (sortOrder && sortOrder !== "desc") {
    params.set("sortOrder", sortOrder);
  }

  if (paymentMethod) {
    params.set("paymentMethod", paymentMethod);
  }

  if (paymentStatus && paymentStatus !== "all") {
    params.set("paymentStatus", paymentStatus);
  }

  if (fulfillmentStatus && fulfillmentStatus !== "all") {
    params.set("fulfillmentStatus", fulfillmentStatus);
  }

  const search = params.toString();
  return search
    ? `/admin/orders/all-orders?${search}`
    : "/admin/orders/all-orders";
}

function getNextSortOrder(
  activeSortBy: AdminOrderSortField,
  activeSortOrder: AdminOrderSortOrder,
  targetSortBy: AdminOrderSortField,
) {
  if (activeSortBy !== targetSortBy) {
    return getDefaultSortOrder(targetSortBy);
  }

  return activeSortOrder === "asc" ? "desc" : "asc";
}

function SortIndicator({
  isActive,
  sortOrder,
}: {
  isActive: boolean;
  sortOrder: AdminOrderSortOrder;
}) {
  if (!isActive) {
    return <ArrowUpDown className="size-4" />;
  }

  return sortOrder === "asc" ? (
    <ArrowUp className="size-4" />
  ) : (
    <ArrowDown className="size-4" />
  );
}

function SortableHeader({
  label,
  targetSortBy,
  activeSortBy,
  activeSortOrder,
  query,
  paymentMethod,
  paymentStatus,
  fulfillmentStatus,
}: {
  label: string;
  targetSortBy: AdminOrderSortField;
  activeSortBy: AdminOrderSortField;
  activeSortOrder: AdminOrderSortOrder;
  query?: string;
  paymentMethod?: string;
  paymentStatus: AdminOrderPaymentStatusFilter;
  fulfillmentStatus: AdminOrderFulfillmentStatusFilter;
}) {
  const isActive = activeSortBy === targetSortBy;
  const nextSortOrder = getNextSortOrder(
    activeSortBy,
    activeSortOrder,
    targetSortBy,
  );

  return (
    <Button asChild variant="ghost" size="sm" className="-ml-3 h-8 px-3">
      <Link
        href={buildAllOrdersHref({
          query,
          sortBy: targetSortBy,
          sortOrder: nextSortOrder,
          paymentMethod,
          paymentStatus,
          fulfillmentStatus,
        })}
        className="inline-flex items-center gap-1.5">
        <span>{label}</span>
        <SortIndicator isActive={isActive} sortOrder={activeSortOrder} />
      </Link>
    </Button>
  );
}

type AdminOrderRow = {
  id: string;
  createdAt: string | Date;
  totalPrice: string | number;
  paymentMethod?: string | null;
  paymentStatus: OrderPaymentStatusValue;
  fulfillmentStatus: OrderFulfillmentStatusValue;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  orderItems?: unknown[];
};

export default async function AdminAllOrdersPage(props: {
  searchParams: Promise<{
    page?: string;
    query?: string;
    sortBy?: string;
    sortOrder?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    fulfillmentStatus?: string;
  }>;
}) {
  await requireAdmin();

  const {
    page = "1",
    query = "",
    sortBy,
    sortOrder,
    paymentMethod = "",
    paymentStatus,
    fulfillmentStatus,
  } = await props.searchParams;

  const activeSortBy = normalizeSortField(sortBy);
  const activeSortOrder = normalizeSortOrder(sortOrder);
  const activePaymentStatus = normalizePaymentStatusFilter(paymentStatus);
  const activeFulfillmentStatus =
    normalizeFulfillmentStatusFilter(fulfillmentStatus);

  const [orders, filterOptions] = await Promise.all([
    getAllOrders({
      page: Number(page) || 1,
      query: query || undefined,
      sortBy: activeSortBy,
      sortOrder: activeSortOrder,
      paymentMethod: paymentMethod || undefined,
      paymentStatus: activePaymentStatus,
      fulfillmentStatus: activeFulfillmentStatus,
    }),
    getAdminOrderFilterOptions(),
  ]);

  const hasActiveFilters = Boolean(
    query ||
    paymentMethod ||
    activePaymentStatus !== "all" ||
    activeFulfillmentStatus !== "all",
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="h2-bold">All Orders</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Search the full order book and sort by buyer, date, total, payment,
            or fulfillment state directly from the table headers. Filter by
            saved database states to jump to the exact orders you need.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/orders">Orders dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/orders/deleted">Deleted orders</Link>
          </Button>
        </div>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full max-w-4xl space-y-3">
            <form
              action="/admin/orders/all-orders"
              method="GET"
              className="grid gap-2 md:grid-cols-[minmax(0,1.4fr)_180px_180px_180px_auto]">
              <Input
                type="search"
                name="query"
                defaultValue={query}
                placeholder="Search by buyer or order ID"
              />
              <select
                name="paymentMethod"
                defaultValue={paymentMethod}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                <option value="">All payment methods</option>
                {filterOptions.paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
              <select
                name="paymentStatus"
                defaultValue={activePaymentStatus}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                <option value="all">All payment states</option>
                {ORDER_PAYMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {getOrderPaymentStatusLabel(status)}
                  </option>
                ))}
              </select>
              <select
                name="fulfillmentStatus"
                defaultValue={activeFulfillmentStatus}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                <option value="all">All fulfillment states</option>
                {ORDER_FULFILLMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {getOrderFulfillmentStatusLabel(status)}
                  </option>
                ))}
              </select>
              <input type="hidden" name="sortBy" value={activeSortBy} />
              <input type="hidden" name="sortOrder" value={activeSortOrder} />
              <Button type="submit">
                <Search className="size-4" />
                Search
              </Button>
            </form>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                <SlidersHorizontal className="mr-1 size-3" />
                Sorted by {activeSortBy} {activeSortOrder}
              </Badge>
              {paymentMethod && (
                <Badge variant="outline">Payment method: {paymentMethod}</Badge>
              )}
              {activePaymentStatus !== "all" && (
                <Badge variant="outline">
                  Payment: {getOrderPaymentStatusLabel(activePaymentStatus)}
                </Badge>
              )}
              {activeFulfillmentStatus !== "all" && (
                <Badge variant="outline">
                  Fulfillment:{" "}
                  {getOrderFulfillmentStatusLabel(activeFulfillmentStatus)}
                </Badge>
              )}
              <Badge variant="outline">
                {formatNumber(orders.data.length)} rows on this page
              </Badge>
              <Badge variant="outline">
                {formatNumber(orders.totalPages)} pages
              </Badge>
            </div>
          </div>

          {hasActiveFilters && (
            <Button asChild size="sm" variant="outline">
              <Link
                href={buildAllOrdersHref({
                  sortBy: activeSortBy,
                  sortOrder: activeSortOrder,
                })}>
                Clear filter
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order ledger</CardTitle>
          <CardDescription>
            Click a header to reorder the current admin order list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>
                    <SortableHeader
                      label="BUYER"
                      targetSortBy="buyer"
                      activeSortBy={activeSortBy}
                      activeSortOrder={activeSortOrder}
                      query={query || undefined}
                      paymentMethod={paymentMethod || undefined}
                      paymentStatus={activePaymentStatus}
                      fulfillmentStatus={activeFulfillmentStatus}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      label="DATE"
                      targetSortBy="date"
                      activeSortBy={activeSortBy}
                      activeSortOrder={activeSortOrder}
                      query={query || undefined}
                      paymentMethod={paymentMethod || undefined}
                      paymentStatus={activePaymentStatus}
                      fulfillmentStatus={activeFulfillmentStatus}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      label="TOTAL"
                      targetSortBy="total"
                      activeSortBy={activeSortBy}
                      activeSortOrder={activeSortOrder}
                      query={query || undefined}
                      paymentMethod={paymentMethod || undefined}
                      paymentStatus={activePaymentStatus}
                      fulfillmentStatus={activeFulfillmentStatus}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      label="PAYMENT STATUS"
                      targetSortBy="paymentStatus"
                      activeSortBy={activeSortBy}
                      activeSortOrder={activeSortOrder}
                      query={query || undefined}
                      paymentMethod={paymentMethod || undefined}
                      paymentStatus={activePaymentStatus}
                      fulfillmentStatus={activeFulfillmentStatus}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      label="ORDER STATUS"
                      targetSortBy="fulfillmentStatus"
                      activeSortBy={activeSortBy}
                      activeSortOrder={activeSortOrder}
                      query={query || undefined}
                      paymentMethod={paymentMethod || undefined}
                      paymentStatus={activePaymentStatus}
                      fulfillmentStatus={activeFulfillmentStatus}
                    />
                  </TableHead>
                  <TableHead className="text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.data.length > 0 ? (
                  orders.data.map((order) => {
                    const item = order as unknown as AdminOrderRow;

                    return (
                      <TableRow key={item.id}>
                        <TableCell>{formatId(item.id)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {item.user?.name || "Deleted User"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.user?.email || "No email"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDateTime(new Date(item.createdAt)).dateTime}
                        </TableCell>
                        <TableCell>{formatCurrency(item.totalPrice)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge
                              variant={getOrderPaymentStatusTone(
                                item.paymentStatus,
                              )}>
                              {getOrderPaymentStatusLabel(item.paymentStatus)}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {item.paymentMethod || "No payment method"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge
                              variant={getOrderFulfillmentStatusTone(
                                item.fulfillmentStatus,
                              )}>
                              {getOrderFulfillmentStatusLabel(
                                item.fulfillmentStatus,
                              )}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {formatNumber(item.orderItems?.length ?? 0)} items
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button asChild size="sm" variant="outline">
                              <Link
                                href={`/order/${item.id}`}
                                target="_blank"
                                rel="noopener noreferrer">
                                Details
                              </Link>
                            </Button>
                            <DeleteDialog id={item.id} action={deleteOrder} />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-muted-foreground">
                      No orders matched the current search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {orders.totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                page={Number(page) || 1}
                totalPages={orders.totalPages}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
