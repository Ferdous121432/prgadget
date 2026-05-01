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
import { getOrderSummary } from "@/lib/actions/order.actions";
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
  BadgeDollarSign,
  Barcode,
  Boxes,
  CreditCard,
  PackageCheck,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import Charts from "./charts";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

function getPercentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function getBadgeVariant(value: number) {
  if (value > 0) return "default" as const;
  if (value < 0) return "destructive" as const;
  return "secondary" as const;
}

function getStatusTone(value: number, warningThreshold: number) {
  if (value <= warningThreshold) return "destructive" as const;
  return "secondary" as const;
}

function buildAllOrdersHref({
  sortBy,
  sortOrder,
  paymentStatus,
  fulfillmentStatus,
}: {
  sortBy?: "buyer" | "date" | "total" | "paymentStatus" | "fulfillmentStatus";
  sortOrder?: "asc" | "desc";
  paymentStatus?: string;
  fulfillmentStatus?: string;
}) {
  const params = new URLSearchParams();

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

const AdminOverviewPage = async () => {
  await requireAdmin();

  const summaryRaw = await getOrderSummary();
  if (!summaryRaw) {
    throw new Error("Order summary could not be loaded.");
  }
  const summary = convertPrismaObjectToJSObject(summaryRaw);

  const monthlySales = summary.salesData ?? [];
  const currentMonthSales = monthlySales.at(-1)?.totalSales ?? 0;
  const previousMonthSales = monthlySales.at(-2)?.totalSales ?? 0;
  const revenueChange = getPercentChange(currentMonthSales, previousMonthSales);
  const totalRevenue = Number(summary.totalSales?._sum?.totalPrice ?? 0);
  const averageOrderValue =
    summary.ordersCount > 0 ? totalRevenue / summary.ordersCount : 0;
  const paidRate =
    summary.ordersCount > 0
      ? (summary.paidOrdersCount / summary.ordersCount) * 100
      : 0;
  const fulfillmentRate =
    summary.ordersCount > 0
      ? (summary.deliveredOrdersCount / summary.ordersCount) * 100
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="h2-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor revenue, order flow, inventory risk, and catalog activity
            from one operational overview.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/orders">Manage orders</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/products">Manage products</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/products/create">Add product</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <Link
          href={buildAllOrdersHref({ sortBy: "total" })}
          className="block h-full">
          <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <BadgeDollarSign />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalRevenue)}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Lifetime gross sales across all paid and unpaid orders.
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/orders" className="block h-full">
          <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Trend
              </CardTitle>
              <CreditCard />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {revenueChange >= 0 ? "+" : ""}
                {revenueChange.toFixed(1)}%
              </div>
              <Badge variant={getBadgeVariant(revenueChange)} className="mt-2">
                {formatCurrency(currentMonthSales)} this month
              </Badge>
            </CardContent>
          </Card>
        </Link>
        <Link
          href={buildAllOrdersHref({ sortBy: "total" })}
          className="block h-full">
          <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Order Value
              </CardTitle>
              <ShoppingCart />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(averageOrderValue)}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Based on {formatNumber(summary.ordersCount)} total orders.
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/users" className="block h-full">
          <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(summary.usersCount)}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Registered shoppers with active account history.
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/products" className="block h-full">
          <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Catalog</CardTitle>
              <Barcode />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(summary.productCounts)}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Active products currently available in the catalog.
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link
          href={buildAllOrdersHref({ sortBy: "fulfillmentStatus" })}
          className="block h-full">
          <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fulfillment</CardTitle>
              <Truck />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {fulfillmentRate.toFixed(0)}%
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatNumber(summary.deliveredOrdersCount)} delivered and{" "}
                {formatNumber(summary.processingOrdersCount)} still in queue.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Charts data={summary.salesData} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle>Order health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link
              href={buildAllOrdersHref({
                paymentStatus: "PAID",
                sortBy: "paymentStatus",
              })}
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:border-primary/40 hover:bg-muted/30">
              <div>
                <p className="text-sm font-medium">Paid orders</p>
                <p className="text-2xl font-semibold">
                  {formatNumber(summary.paidOrdersCount)}
                </p>
              </div>
              <Badge variant="secondary">
                {paidRate.toFixed(0)}% paid rate
              </Badge>
            </Link>
            <Link
              href={buildAllOrdersHref({
                paymentStatus: "PENDING",
                sortBy: "paymentStatus",
              })}
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:border-primary/40 hover:bg-muted/30">
              <div>
                <p className="text-sm font-medium">Awaiting payment</p>
                <p className="text-2xl font-semibold">
                  {formatNumber(summary.unpaidOrdersCount)}
                </p>
              </div>
              <Badge variant={getStatusTone(summary.unpaidOrdersCount, 3)}>
                Needs follow-up
              </Badge>
            </Link>
            <Link
              href={buildAllOrdersHref({
                fulfillmentStatus: "PROCESSING",
                sortBy: "fulfillmentStatus",
              })}
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:border-primary/40 hover:bg-muted/30">
              <div>
                <p className="text-sm font-medium">In fulfillment</p>
                <p className="text-2xl font-semibold">
                  {formatNumber(summary.processingOrdersCount)}
                </p>
              </div>
              <Badge variant={getStatusTone(summary.processingOrdersCount, 5)}>
                Shipping queue
              </Badge>
            </Link>
          </CardContent>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Inventory watch</CardTitle>
            <AlertTriangle className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Link
              href="/admin/products"
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:border-primary/40 hover:bg-muted/30">
              <div>
                <p className="text-sm font-medium">Low-stock SKUs</p>
                <p className="text-2xl font-semibold">
                  {formatNumber(summary.lowStockProducts.length)}
                </p>
              </div>
              <Badge
                variant={
                  summary.lowStockProducts.length > 0
                    ? "destructive"
                    : "secondary"
                }>
                Threshold: 5 units
              </Badge>
            </Link>

            <div className="space-y-3">
              {summary.lowStockProducts.length > 0 ? (
                summary.lowStockProducts.map((product: any) => (
                  <Link
                    key={product.id}
                    href={`/admin/products/${product.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:border-primary/40 hover:bg-muted/30">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.MainCategory?.name ?? "Uncategorized"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusTone(product.stock, 2)}>
                        {product.stock} left
                      </Badge>
                      <span className="text-xs font-medium text-primary underline-offset-4 hover:underline">
                        Restock
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No low-stock products need immediate attention.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>BUYER</TableHead>
                  <TableHead>DATE</TableHead>
                  <TableHead>TOTAL</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.latestSales
                  .map((order: any) => convertPrismaObjectToJSObject(order))
                  .map((order: any) => {
                    const orderHref = `/order/${order.id}`;

                    return (
                      <TableRow key={order.id} className="hover:bg-muted/40">
                        <TableCell className="p-0">
                          <Link
                            href={orderHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-4 py-3">
                            <div className="space-y-1">
                              <div className="font-medium">
                                {order?.user?.name
                                  ? order.user.name
                                  : "Deleted User"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatId(order.id)}
                              </div>
                            </div>
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
                                {getOrderPaymentStatusLabel(
                                  order.paymentStatus,
                                )}
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
                        <TableCell>
                          <Link
                            href={orderHref}
                            target="_blank"
                            rel="noopener noreferrer">
                            <span className="px-2">Details</span>
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
            <CardTitle>Top sellers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.topProducts.map((product: any, index: number) => (
              <Link
                key={product.productId}
                href={`/admin/products/${product.productId}`}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:border-primary/40 hover:bg-muted/30">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
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
                  <span className="text-xs text-primary underline-offset-4 hover:underline">
                    Open product
                  </span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Department mix</CardTitle>
            <Boxes className="size-4" />
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.topCategories.map((item: any) => (
              <Link
                key={item.category}
                href="/admin/categories"
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:border-primary/40 hover:bg-muted/30">
                <p className="text-sm font-medium">{item.category}</p>
                <Badge variant="outline">
                  {formatNumber(Number(item.productCount))} products
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Admin shortcuts</CardTitle>
            <PackageCheck className="size-4" />
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/admin/orders"
              className="rounded-lg border p-4 transition hover:bg-muted/40">
              <p className="text-sm font-medium">Review orders</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Process payment issues and shipment queue.
              </p>
            </Link>
            <Link
              href="/admin/products"
              className="rounded-lg border p-4 transition hover:bg-muted/40">
              <p className="text-sm font-medium">Update catalog</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Audit pricing, stock, and product visibility.
              </p>
            </Link>
            <Link
              href="/admin/categories"
              className="rounded-lg border p-4 transition hover:bg-muted/40">
              <p className="text-sm font-medium">Manage categories</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Keep department structure and browse paths clean.
              </p>
            </Link>
            <Link
              href="/admin/users"
              className="rounded-lg border p-4 transition hover:bg-muted/40">
              <p className="text-sm font-medium">Inspect customers</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Review shopper accounts and support issues.
              </p>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
