import CheckoutSteps from "@/components/shared/CheckoutSteps";
import { getUserById } from "@/lib/actions/user.actions";
import { requireAuth } from "@/lib/auth-guard";
import { getMyCart } from "@/lib/cart-data";
import {
  mapSavedShippingAddress,
  parseLegacyShippingAddress,
} from "@/lib/shipping-address";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import ShippingAddressForm from "./shipping-address-form";

export const metadata: Metadata = {
  title: "Shipping Address",
};

// Force dynamic rendering since we use cookies and session data
export const dynamic = "force-dynamic";

const ShippingAddressPage = async () => {
  const cart = await getMyCart();

  if (!cart || cart.items.length === 0) redirect("/cart");

  const session = await requireAuth("/shipping-address");

  const userId = session?.user?.id;

  if (!userId) redirect("/login?callbackUrl=%2Fshipping-address");

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

  return (
    <>
      <CheckoutSteps current={1} />
      <ShippingAddressForm
        addresses={savedAddresses}
        selectedAddressId={selectedAddressId}
        legacyAddress={legacyAddress}
      />
    </>
  );
};

export default ShippingAddressPage;
