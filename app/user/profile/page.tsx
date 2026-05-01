import ShippingAddressForm from "@/app/(root)/shipping-address/shipping-address-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUserById } from "@/lib/actions/user.actions";
import { requireAuth } from "@/lib/auth-guard";
import {
  formatShippingAddressLines,
  mapSavedShippingAddress,
  parseLegacyShippingAddress,
  resolveSelectedShippingAddress,
} from "@/lib/shipping-address";
import {
  CreditCard,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Shield,
  ShoppingBag,
  Star,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import ProfileForm from "./profile-form";

export const metadata: Metadata = {
  title: "Customer Profile",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

const Profile = async () => {
  const session = await requireAuth("/user/profile");
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const user = await getUserById(userId);
  const savedAddresses = ((user.shippingAddresses as never[]) ?? []).map(
    mapSavedShippingAddress,
  );
  const legacyShippingAddress =
    savedAddresses.length === 0
      ? parseLegacyShippingAddress(user.address)
      : null;
  const legacyAddress = legacyShippingAddress
    ? {
        ...legacyShippingAddress,
        label: legacyShippingAddress.label || "Saved address",
        isDefault: true,
      }
    : null;
  const selectedAddressId =
    (user.selectedShippingAddress as { id?: string } | null)?.id ??
    savedAddresses.find((address) => address.isDefault)?.id ??
    null;
  const selectedAddress = resolveSelectedShippingAddress({
    selectedShippingAddress: user.selectedShippingAddress as never,
    shippingAddresses: user.shippingAddresses as never[],
    address: user.address,
  });
  const addressCount = savedAddresses.length + (legacyAddress ? 1 : 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Account hub</Badge>
            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
              {user.role === "admin" ? "Admin access" : "Customer account"}
            </Badge>
          </div>
          <h2 className="h2-bold">Profile</h2>
          <p className="text-sm text-muted-foreground">
            Manage your customer details, saved addresses, order readiness, and
            checkout preferences from one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/user/orders">View all orders</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ShoppingBag className="size-4" />
              Total orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {user._count?.Order ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MapPin className="size-4" />
              Saved addresses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{addressCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Star className="size-4" />
              Reviews written
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {user._count?.Review ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <PackageCheck className="size-4" />
              Cart readiness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {user._count?.Cart ?? 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Active carts connected to this account
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <ProfileForm
            initialValues={{
              name: user.name ?? "",
              email: user.email ?? "",
              phone: user.phone ?? "",
            }}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Shield className="size-5" />
                Account overview
              </CardTitle>
              <CardDescription>
                Core details customers usually expect to find quickly inside a
                modern ecommerce account area.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email address</p>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Phone number</p>
                  <p className="text-muted-foreground">
                    {user.phone || "Not configured yet"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Preferred payment method</p>
                  <p className="text-muted-foreground">
                    {user.paymentMethod || "Not configured yet"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Current selected address</p>
                  {selectedAddress ? (
                    <div className="space-y-1 text-muted-foreground">
                      {formatShippingAddressLines(selectedAddress).map(
                        (line) => (
                          <p key={line}>{line}</p>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No address selected yet
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden border-none bg-transparent shadow-none">
          <CardContent className="p-0">
            <ShippingAddressForm
              addresses={savedAddresses}
              selectedAddressId={selectedAddressId}
              legacyAddress={legacyAddress}
              mode="account"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
