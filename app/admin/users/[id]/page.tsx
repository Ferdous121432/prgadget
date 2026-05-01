import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getUserById } from "@/lib/actions/user.actions";
import { requireAdmin } from "@/lib/auth-guard";
import { resolveSelectedShippingAddress } from "@/lib/shipping-address";
import { formatDateTime, formatId } from "@/lib/utils";
import {
  Calendar,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShoppingBag,
  Star,
  UserCircle2,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import UpdateUserForm from "./update-user-form";

export const metadata: Metadata = {
  title: "Update User",
};

type UserAddress = {
  fullName?: string;
  streetAddress?: string;
  city?: string;
  postalCode?: string;
  country?: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatAddress(address: UserAddress | null | undefined) {
  if (!address) return "No shipping address saved";

  return [
    address.fullName,
    address.streetAddress,
    [address.city, address.postalCode].filter(Boolean).join(", "),
    address.country,
  ]
    .filter(Boolean)
    .join(" • ");
}

const AdminUserUpdatePage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  await requireAdmin();

  const { id } = await props.params;

  const user = await getUserById(id);

  if (!user) notFound();

  const resolvedAddress = resolveSelectedShippingAddress({
    selectedShippingAddress: user.selectedShippingAddress as never,
    shippingAddresses: user.shippingAddresses as never[],
    address: user.address,
  });
  const address = (resolvedAddress as UserAddress | null | undefined) ?? null;
  const savedAddressCount = ((user.shippingAddresses as unknown[]) ?? [])
    .length;
  const hasAddress = Boolean(address?.streetAddress || address?.country);
  const hasPaymentMethod = Boolean(user.paymentMethod);
  const hasPhone = Boolean(user.phone);
  const isVerified = Boolean(user.emailVerified);
  const userRoleTone = user.role === "admin" ? "default" : "secondary";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/admin/users" className="hover:text-foreground">
              Users
            </Link>
            <span>/</span>
            <span>{user.name}</span>
          </div>
          <h1 className="h2-bold">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Review account health, customer profile details, and access settings
            before applying admin changes.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/users">Back to users</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`mailto:${user.email}`}>Email user</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-4">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="size-16 border">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="text-lg font-semibold">
                    {getInitials(user.name || user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 space-y-2">
                  <div>
                    <CardTitle className="truncate text-xl">
                      {user.name}
                    </CardTitle>
                    <CardDescription className="truncate">
                      {user.email}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={userRoleTone}>
                      {user.role === "admin" ? "Admin access" : "General user"}
                    </Badge>
                    <Badge variant={isVerified ? "secondary" : "outline"}>
                      {isVerified ? "Email verified" : "Email unverified"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShoppingBag className="size-4" />
                    Orders
                  </div>
                  <p className="mt-2 text-2xl font-semibold">
                    {user._count?.Order ?? 0}
                  </p>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="size-4" />
                    Reviews
                  </div>
                  <p className="mt-2 text-2xl font-semibold">
                    {user._count?.Review ?? 0}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-muted-foreground">
                      {hasPhone ? user.phone : "No phone number saved"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Payment Method</p>
                    <p className="text-muted-foreground">
                      {hasPaymentMethod
                        ? user.paymentMethod
                        : "No payment preference saved"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Shipping Address</p>
                    <p className="text-muted-foreground">
                      {formatAddress(address)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {savedAddressCount} saved in address book
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Health</CardTitle>
              <CardDescription>
                Fast checks for readiness across authentication and checkout.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Shield className="size-4 text-muted-foreground" />
                  Access level
                </div>
                <Badge variant={userRoleTone}>{user.role}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="size-4 text-muted-foreground" />
                  Email status
                </div>
                <Badge variant={isVerified ? "secondary" : "outline"}>
                  {isVerified ? "Verified" : "Pending"}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="size-4 text-muted-foreground" />
                  Address setup
                </div>
                <Badge variant={hasAddress ? "secondary" : "outline"}>
                  {hasAddress ? "Complete" : "Missing"}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CreditCard className="size-4 text-muted-foreground" />
                  Payment setup
                </div>
                <Badge variant={hasPaymentMethod ? "secondary" : "outline"}>
                  {hasPaymentMethod ? "Configured" : "Missing"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Record Details</CardTitle>
              <CardDescription>
                Internal metadata for auditing and support.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4 rounded-xl border p-3">
                <span className="text-muted-foreground">User ID</span>
                <span className="font-medium">{formatId(user.id)}</span>
              </div>
              <div className="flex items-start justify-between gap-4 rounded-xl border p-3">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-4" />
                  Joined
                </span>
                <span className="text-right font-medium">
                  {formatDateTime(new Date(user.createdAt)).dateOnly}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 rounded-xl border p-3">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <UserCircle2 className="size-4" />
                  Last updated
                </span>
                <span className="text-right font-medium">
                  {formatDateTime(new Date(user.updatedAt)).dateTime}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 rounded-xl border p-3">
                <span className="text-muted-foreground">Active carts</span>
                <span className="font-medium">{user._count?.Cart ?? 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Edit Account Access</CardTitle>
              <CardDescription>
                Adjust the user name and role while keeping the account history
                and customer profile visible alongside the change.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UpdateUserForm
                user={{
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  phone: user.phone ?? undefined,
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminUserUpdatePage;
