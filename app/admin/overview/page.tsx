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
  convertPrismaObjectToJSObject,
  formatCurrency,
  formatDateTime,
  formatNumber,
} from "@/lib/utils";
import { Order } from "@/types";
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Trend</CardTitle>
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
        <Card>
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
        <Card>
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
        <Card>
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
        <Card>
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
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Paid orders</p>
                <p className="text-2xl font-semibold">
                  {formatNumber(summary.paidOrdersCount)}
                </p>
              </div>
              <Badge variant="secondary">
                {paidRate.toFixed(0)}% paid rate
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Awaiting payment</p>
                <p className="text-2xl font-semibold">
                  {formatNumber(summary.unpaidOrdersCount)}
                </p>
              </div>
              <Badge variant={getStatusTone(summary.unpaidOrdersCount, 3)}>
                Needs follow-up
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">In fulfillment</p>
                <p className="text-2xl font-semibold">
                  {formatNumber(summary.processingOrdersCount)}
                </p>
              </div>
              <Badge variant={getStatusTone(summary.processingOrdersCount, 5)}>
                Shipping queue
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Inventory watch</CardTitle>
            <AlertTriangle className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
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
            </div>

            <div className="space-y-3">
              {summary.lowStockProducts.length > 0 ? (
                summary.lowStockProducts.map((product: any) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border p-3">
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
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-xs font-medium text-primary underline-offset-4 hover:underline">
                        Restock
                      </Link>
                    </div>
                  </div>
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
                  .map((order: Order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        {order?.user?.name ? order.user.name : "Deleted User"}
                      </TableCell>
                      <TableCell>
                        {formatDateTime(new Date(order.createdAt)).dateOnly}
                      </TableCell>
                      <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant={
                              order.isPaid ? "secondary" : "destructive"
                            }>
                            {order.isPaid ? "Paid" : "Unpaid"}
                          </Badge>
                          <Badge
                            variant={
                              order.isDelivered ? "secondary" : "outline"
                            }>
                            {order.isDelivered ? "Delivered" : "Processing"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/order/${order.id}`}>
                          <span className="px-2">Details</span>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
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
              <div
                key={product.productId}
                className="flex items-center justify-between rounded-lg border p-3">
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
                  <Link
                    href={`/product/${product.slug}`}
                    className="text-xs text-primary underline-offset-4 hover:underline">
                    View PDP
                  </Link>
                </div>
              </div>
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
              <div
                key={item.category}
                className="flex items-center justify-between rounded-lg border p-3">
                <p className="text-sm font-medium">{item.category}</p>
                <Badge variant="outline">
                  {formatNumber(Number(item.productCount))} products
                </Badge>
              </div>
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
