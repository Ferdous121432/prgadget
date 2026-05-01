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
  getAllOrders,
  getOrderSummary,
  type AdminOrderFulfillmentStatusFilter,
  type AdminOrderPaymentStatusFilter,
  type AdminOrderSortField,
  type AdminOrderSortOrder,
  type OrderDateRange,
} from "@/lib/actions/order.actions";
import { requireAdmin } from "@/lib/auth-guard";
import {
  getOrderFulfillmentStatusLabel,
  getOrderFulfillmentStatusTone,
  getOrderPaymentStatusLabel,
  getOrderPaymentStatusTone,
} from "@/lib/order-status";
import {
  convertPrismaObjectToJSObject,
  formatCurrency,
  formatDateTime,
  formatId,
  formatNumber,
} from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  BadgeDollarSign,
  CreditCard,
  PackageCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import Charts from "../overview/charts";

const DATE_RANGE_OPTIONS: Array<{
  value: OrderDateRange;
  label: string;
  description: string;
}> = [
  { value: "today", label: "Today", description: "Since midnight" },
  { value: "7d", label: "7 Days", description: "Last 7 days" },
  { value: "30d", label: "30 Days", description: "Last 30 days" },
  { value: "lifetime", label: "Lifetime", description: "All orders" },
];

function normalizeRange(value?: string): OrderDateRange {
  return DATE_RANGE_OPTIONS.some((option) => option.value === value)
    ? (value as OrderDateRange)
    : "lifetime";
}

function buildOrdersHref({
  query,
  range,
}: {
  query?: string;
  range: OrderDateRange;
}) {
  const params = new URLSearchParams();

  if (query) {
    params.set("query", query);
  }

  if (range !== "lifetime") {
    params.set("range", range);
  }

  const search = params.toString();
  return search ? `/admin/orders?${search}` : "/admin/orders";
}

function buildAllOrdersHref({
  query,
  sortBy,
  sortOrder,
  paymentStatus,
  fulfillmentStatus,
}: {
  query?: string;
  sortBy?: AdminOrderSortField;
  sortOrder?: AdminOrderSortOrder;
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

export const metadata: Metadata = {
  title: "Admin Order Dashboard",
};

function getPercentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function getRate(value: number, total: number) {
  if (total === 0) return 0;
  return (value / total) * 100;
}

function getDeltaVariant(value: number) {
  if (value > 0) return "default" as const;
  if (value < 0) return "destructive" as const;
  return "secondary" as const;
}

function getQueueVariant(value: number, threshold: number) {
  if (value > threshold) return "destructive" as const;
  return "secondary" as const;
}

export default async function AdminOrdersDashboardPage(props: {
  searchParams: Promise<{ page?: string; query?: string; range?: string }>;
}) {
  const { page = "1", query = "", range } = await props.searchParams;
  const activeRange = normalizeRange(range);
  const activeRangeMeta =
    DATE_RANGE_OPTIONS.find((option) => option.value === activeRange) ??
    DATE_RANGE_OPTIONS[3];

  await requireAdmin();

  const [summaryRaw, orders] = await Promise.all([
    getOrderSummary(activeRange),
    getAllOrders({
      page: Number(page) || 1,
      query: query || undefined,
      range: activeRange,
    }),
  ]);

  if (!summaryRaw) {
    throw new Error("Order summary could not be loaded.");
  }

  const summary = convertPrismaObjectToJSObject(summaryRaw) as unknown as {
    ordersCount: number;
    paidOrdersCount: number;
    unpaidOrdersCount: number;
    deliveredOrdersCount: number;
    processingOrdersCount: number;
    totalSales?: { _sum?: { totalPrice?: number | string | null } };
    salesData?: { month: string; totalSales: number }[];
    latestSales: Array<{
      id: string;
      createdAt: string | Date;
      totalPrice: number | string;
      paymentStatus: string;
      fulfillmentStatus: string;
      user?: { name?: string | null; email?: string | null } | null;
    }>;
    lowStockProducts: Array<{
      id: string;
      name: string;
      stock: number;
      MainCategory?: { name?: string | null } | null;
    }>;
    topProducts: Array<{
      productId: string;
      name: string;
      slug: string;
      unitsSold: string;
      revenue: string;
    }>;
  };

  const monthlySales = summary.salesData ?? [];
  const currentMonthSales = monthlySales.at(-1)?.totalSales ?? 0;
  const previousMonthSales = monthlySales.at(-2)?.totalSales ?? 0;
  const revenueDelta = getPercentChange(currentMonthSales, previousMonthSales);
  const totalRevenue = Number(summary.totalSales?._sum?.totalPrice ?? 0);
  const averageOrderValue =
    summary.ordersCount > 0 ? totalRevenue / summary.ordersCount : 0;
  const paidRate = getRate(summary.paidOrdersCount, summary.ordersCount);
  const deliveredRate = getRate(
    summary.deliveredOrdersCount,
    summary.ordersCount,
  );
  const openQueue = summary.unpaidOrdersCount + summary.processingOrdersCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="h2-bold">Orders Command Center</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Track revenue momentum, payment capture, delivery progress, and the
            live order queue from a single commerce operations dashboard.
          </p>
          <div className="pt-1 text-xs text-muted-foreground">
            Viewing{" "}
            <span className="font-medium text-foreground">
              {activeRangeMeta.label}
            </span>{" "}
            window: {activeRangeMeta.description.toLowerCase()}.
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/overview">Store overview</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/orders/all-orders">All orders</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/orders/deleted">Deleted orders</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/products">Catalog</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/products/create">Add product</Link>
          </Button>
        </div>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full max-w-xl space-y-3">
            <form action="/admin/orders" method="GET" className="flex gap-2">
              <Input
                type="search"
                name="query"
                defaultValue={query}
                placeholder="Search by buyer or order ID"
              />
              {activeRange !== "lifetime" && (
                <input type="hidden" name="range" value={activeRange} />
              )}
              <Button type="submit">Search</Button>
            </form>
            <div className="flex flex-wrap gap-2">
              {DATE_RANGE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  asChild
                  size="sm"
                  variant={
                    option.value === activeRange ? "default" : "outline"
                  }>
                  <Link
                    href={buildOrdersHref({
                      query: query || undefined,
                      range: option.value,
                    })}>
                    {option.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {formatNumber(summary.ordersCount)} orders in range
            </Badge>
            <Badge variant="outline">
              {formatNumber(openQueue)} need attention
            </Badge>
            <Badge variant="outline">Deletes archive to history</Badge>
            <Badge variant="outline">
              {formatNumber(orders.totalPages)} pages in queue
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Link
          href={buildAllOrdersHref({ sortBy: "total" })}
          className="block h-full">
          <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Gross Revenue
              </CardTitle>
              <BadgeDollarSign className="size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalRevenue)}
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant={getDeltaVariant(revenueDelta)}>
                  {revenueDelta >= 0 ? "+" : ""}
                  {revenueDelta.toFixed(1)}%
                </Badge>
                vs previous month
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link
          href={buildAllOrdersHref({ sortBy: "date" })}
          className="block h-full">
          <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Order Volume
              </CardTitle>
              <ShoppingCart className="size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(summary.ordersCount)}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatCurrency(currentMonthSales)} booked in the latest month.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link
          href={buildAllOrdersHref({ sortBy: "total" })}
          className="block h-full">
          <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Order
              </CardTitle>
              <CreditCard className="size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(averageOrderValue)}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Revenue per order across the lifetime order book.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link
          href={buildAllOrdersHref({ sortBy: "paymentStatus" })}
          className="block h-full">
          <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Payment Capture
              </CardTitle>
              <PackageCheck className="size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paidRate.toFixed(0)}%</div>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatNumber(summary.paidOrdersCount)} paid and{" "}
                {formatNumber(summary.unpaidOrdersCount)} pending or failed.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link
          href={buildAllOrdersHref({ sortBy: "fulfillmentStatus" })}
          className="block h-full">
          <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Fulfillment Rate
              </CardTitle>
              <Truck className="size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {deliveredRate.toFixed(0)}%
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatNumber(summary.deliveredOrdersCount)} delivered and{" "}
                {formatNumber(summary.processingOrdersCount)} placed,
                processing, or shipped.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
            <CardDescription>
              Monthly sales performance from completed and in-flight orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Charts data={monthlySales} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-5">
          <CardHeader>
            <CardTitle>Operations pulse</CardTitle>
            <CardDescription>
              The order states that need admin attention first.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border p-4">
              <Link href="#live-order-queue" className="block">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Open queue</p>
                    <p className="text-2xl font-semibold">
                      {formatNumber(openQueue)}
                    </p>
                  </div>
                  <Badge variant={getQueueVariant(openQueue, 8)}>
                    Monitor closely
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Unpaid orders plus orders still moving through fulfillment.
                </p>
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href={buildAllOrdersHref({ sortBy: "paymentStatus" })}
                className="block rounded-xl border p-4 transition-colors hover:border-primary/40 hover:bg-muted/30">
                <p className="text-sm font-medium">Awaiting payment</p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatNumber(summary.unpaidOrdersCount)}
                </p>
                <Badge
                  variant={getQueueVariant(summary.unpaidOrdersCount, 3)}
                  className="mt-3">
                  Payment follow-up
                </Badge>
              </Link>
              <Link
                href={buildAllOrdersHref({ sortBy: "fulfillmentStatus" })}
                className="block rounded-xl border p-4 transition-colors hover:border-primary/40 hover:bg-muted/30">
                <p className="text-sm font-medium">In fulfillment</p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatNumber(summary.processingOrdersCount)}
                </p>
                <Badge
                  variant={getQueueVariant(summary.processingOrdersCount, 5)}
                  className="mt-3">
                  Shipping queue
                </Badge>
              </Link>
            </div>

            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Inventory blockers</p>
                  <p className="text-2xl font-semibold">
                    {formatNumber(summary.lowStockProducts.length)}
                  </p>
                </div>
                <AlertTriangle className="size-4 text-amber-600" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Products at or below 5 units that can slow fulfillment.
              </p>
              <div className="mt-4 space-y-2">
                {summary.lowStockProducts.slice(0, 3).map((product) => (
                  <Link
                    key={product.id}
                    href={`/admin/products/${product.id}`}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 transition-colors hover:border-primary/40 hover:bg-muted/30">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.MainCategory?.name ?? "Uncategorized"}
                      </p>
                    </div>
                    <Badge variant={getQueueVariant(product.stock, 2)}>
                      {product.stock} left
                    </Badge>
                  </Link>
                ))}
                {summary.lowStockProducts.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No low-stock products need immediate action.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Recent orders</CardTitle>
              <CardDescription>
                Latest transactions with explicit payment and fulfillment state.
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="#live-order-queue">Jump to queue</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ORDER</TableHead>
                  <TableHead>BUYER</TableHead>
                  <TableHead>DATE</TableHead>
                  <TableHead>TOTAL</TableHead>
                  <TableHead>STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.latestSales.map((order) => {
                  const orderHref = `/order/${order.id}`;

                  return (
                    <TableRow key={order.id} className="hover:bg-muted/40">
                      <TableCell className="p-0">
                        <Link
                          href={orderHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block px-4 py-3">
                          {formatId(order.id)}
                        </Link>
                      </TableCell>
                      <TableCell className="p-0">
                        <Link
                          href={orderHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block px-4 py-3">
                          {order.user?.name ||
                            order.user?.email ||
                            "Deleted User"}
                        </Link>
                      </TableCell>
                      <TableCell className="p-0">
                        <Link
                          href={orderHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block px-4 py-3">
                          {formatDateTime(new Date(order.createdAt)).dateOnly}
                        </Link>
                      </TableCell>
                      <TableCell className="p-0">
                        <Link
                          href={orderHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block px-4 py-3">
                          {formatCurrency(order.totalPrice)}
                        </Link>
                      </TableCell>
                      <TableCell className="p-0">
                        <Link
                          href={orderHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant={getOrderPaymentStatusTone(
                                order.paymentStatus,
                              )}>
                              {getOrderPaymentStatusLabel(order.paymentStatus)}
                            </Badge>
                            <Badge
                              variant={getOrderFulfillmentStatusTone(
                                order.fulfillmentStatus,
                              )}>
                              {getOrderFulfillmentStatusLabel(
                                order.fulfillmentStatus,
                              )}
                            </Badge>
                          </div>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="xl:col-span-5">
          <CardHeader>
            <CardTitle>Top ordered products</CardTitle>
            <CardDescription>
              The products generating the strongest order velocity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.topProducts.map((product, index) => (
              <Link
                key={product.productId}
                href={`/admin/products/${product.productId}`}
                className="flex items-center justify-between rounded-xl border p-3 transition-colors hover:border-primary/40 hover:bg-muted/30">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {index + 1}. {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(Number(product.unitsSold))} units sold
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatCurrency(product.revenue)}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline">
                    Open product
                    <ArrowRight className="size-3" />
                  </span>
                </div>
              </Link>
            ))}
            {summary.topProducts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Top products will appear here once orders start flowing.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card id="live-order-queue">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Live order queue</CardTitle>
            <CardDescription>
              Search buyers or order IDs, then drill into the orders that need
              action.
            </CardDescription>
          </div>
          {query && (
            <div className="flex items-center gap-2">
              <Badge variant="outline">Filtered by {query}</Badge>
              <Button asChild size="sm" variant="outline">
                <Link
                  href={buildOrdersHref({
                    range: activeRange,
                  })}>
                  Clear filter
                </Link>
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>BUYER</TableHead>
                  <TableHead>DATE</TableHead>
                  <TableHead>ITEMS</TableHead>
                  <TableHead>TOTAL</TableHead>
                  <TableHead>PAYMENT</TableHead>
                  <TableHead>FULFILLMENT</TableHead>
                  <TableHead className="text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.data.length > 0 ? (
                  orders.data.map((order: any) => {
                    const orderHref = `/order/${order.id}`;

                    return (
                      <TableRow key={order.id} className="hover:bg-muted/40">
                        <TableCell className="p-0">
                          <Link
                            href={orderHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-4 py-3">
                            {formatId(order.id)}
                          </Link>
                        </TableCell>
                        <TableCell className="p-0">
                          <Link
                            href={orderHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-4 py-3">
                            <div>
                              <p className="font-medium">
                                {order.user?.name || "Deleted User"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {order.user?.email || "No email"}
                              </p>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="p-0">
                          <Link
                            href={orderHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-4 py-3">
                            {formatDateTime(new Date(order.createdAt)).dateTime}
                          </Link>
                        </TableCell>
                        <TableCell className="p-0">
                          <Link
                            href={orderHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-4 py-3">
                            {formatNumber(order.orderItems?.length ?? 0)}
                          </Link>
                        </TableCell>
                        <TableCell className="p-0">
                          <Link
                            href={orderHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-4 py-3">
                            {formatCurrency(order.totalPrice)}
                          </Link>
                        </TableCell>
                        <TableCell className="p-0">
                          <Link
                            href={orderHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-4 py-3">
                            <Badge
                              variant={getOrderPaymentStatusTone(
                                order.paymentStatus,
                              )}>
                              {getOrderPaymentStatusLabel(order.paymentStatus)}
                            </Badge>
                          </Link>
                        </TableCell>
                        <TableCell className="p-0">
                          <Link
                            href={orderHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-4 py-3">
                            <Badge
                              variant={getOrderFulfillmentStatusTone(
                                order.fulfillmentStatus,
                              )}>
                              {getOrderFulfillmentStatusLabel(
                                order.fulfillmentStatus,
                              )}
                            </Badge>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button asChild size="sm" variant="outline">
                              <Link
                                href={orderHref}
                                target="_blank"
                                rel="noopener noreferrer">
                                Details
                              </Link>
                            </Button>
                            <DeleteDialog id={order.id} action={deleteOrder} />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-10 text-center text-muted-foreground">
                      No orders matched the current filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {orders.totalPages > 1 && (
            <Pagination
              page={Number(page) || 1}
              totalPages={orders.totalPages}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
