import { shippingAddressSchema } from "@/lib/validators";
import type { SavedShippingAddress, ShippingAddress } from "@/types";

type ShippingAddressRecord = {
  id: string;
  label: string;
  fullName: string;
  phone: string | null;
  streetAddress: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  deliveryInstructions: string | null;
  isDefault: boolean;
};

type UserAddressSource = {
  selectedShippingAddressId?: string | null;
  selectedShippingAddress?: ShippingAddressRecord | null;
  shippingAddresses?: ShippingAddressRecord[];
  address?: unknown;
};

function normalizeText(value?: string | null) {
  return value ?? "";
}

export function mapSavedShippingAddress(
  address: ShippingAddressRecord,
): SavedShippingAddress {
  return {
    id: address.id,
    label: address.label,
    fullName: address.fullName,
    phone: normalizeText(address.phone),
    streetAddress: address.streetAddress,
    addressLine2: normalizeText(address.addressLine2),
    city: address.city,
    state: normalizeText(address.state),
    postalCode: address.postalCode,
    country: address.country,
    deliveryInstructions: normalizeText(address.deliveryInstructions),
    isDefault: address.isDefault,
  };
}

export function savedAddressToShippingAddress(
  address: SavedShippingAddress,
): ShippingAddress {
  return shippingAddressSchema.parse({
    label: address.label,
    fullName: address.fullName,
    phone: normalizeText(address.phone),
    streetAddress: address.streetAddress,
    addressLine2: normalizeText(address.addressLine2),
    city: address.city,
    state: normalizeText(address.state),
    postalCode: address.postalCode,
    country: address.country,
    deliveryInstructions: normalizeText(address.deliveryInstructions),
    lat: address.lat,
    lng: address.lng,
  });
}

export function parseLegacyShippingAddress(address: unknown) {
  if (!address || typeof address !== "object") {
    return null;
  }

  const result = shippingAddressSchema.safeParse({
    label: "Saved address",
    fullName:
      "fullName" in address && typeof address.fullName === "string"
        ? address.fullName
        : "",
    phone:
      "phone" in address && typeof address.phone === "string"
        ? address.phone
        : "",
    streetAddress:
      "streetAddress" in address && typeof address.streetAddress === "string"
        ? address.streetAddress
        : "",
    addressLine2:
      "addressLine2" in address && typeof address.addressLine2 === "string"
        ? address.addressLine2
        : "",
    city:
      "city" in address && typeof address.city === "string" ? address.city : "",
    state:
      "state" in address && typeof address.state === "string"
        ? address.state
        : "",
    postalCode:
      "postalCode" in address && typeof address.postalCode === "string"
        ? address.postalCode
        : "",
    country:
      "country" in address && typeof address.country === "string"
        ? address.country
        : "",
    deliveryInstructions:
      "deliveryInstructions" in address &&
      typeof address.deliveryInstructions === "string"
        ? address.deliveryInstructions
        : "",
  });

  return result.success ? result.data : null;
}

export function formatShippingAddressLines(address: ShippingAddress) {
  const lineTwo = [address.city, address.state, address.postalCode]
    .filter(Boolean)
    .join(", ");

  return [
    address.fullName,
    address.phone,
    address.label,
    address.streetAddress,
    address.addressLine2,
    lineTwo,
    address.country,
    address.deliveryInstructions
      ? `Delivery notes: ${address.deliveryInstructions}`
      : "",
  ].filter(Boolean);
}

export function resolveSelectedSavedShippingAddress(user: UserAddressSource) {
  if (user.selectedShippingAddress) {
    return mapSavedShippingAddress(user.selectedShippingAddress);
  }

  const selectedFromList = user.shippingAddresses?.find(
    (address) => address.id === user.selectedShippingAddressId,
  );

  if (selectedFromList) {
    return mapSavedShippingAddress(selectedFromList);
  }

  const defaultAddress = user.shippingAddresses?.find(
    (address) => address.isDefault,
  );

  if (defaultAddress) {
    return mapSavedShippingAddress(defaultAddress);
  }

  return null;
}

export function resolveSelectedShippingAddress(user: UserAddressSource) {
  const savedAddress = resolveSelectedSavedShippingAddress(user);

  if (savedAddress) {
    return savedAddressToShippingAddress(savedAddress);
  }

  return parseLegacyShippingAddress(user.address);
}
