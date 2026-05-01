"use server";

import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/db/prisma";
import { getMyCart } from "@/lib/cart-data";
import {
  paymentMethodSchema,
  saveShippingAddressSchema,
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
  updateProfileSchema,
} from "@/lib/validators";
import { PaymentMethod, SavedShippingAddress, ShippingAddress } from "@/types";
import { hashSync } from "bcrypt-ts-edge";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { DB_ADMIN_USERS_TAKE } from "../constants";
import { Prisma } from "../generated/prisma";
import { formatError } from "../utils";

const revalidateUserCheckoutPaths = () => {
  revalidatePath("/shipping-address");
  revalidatePath("/payment-method");
  revalidatePath("/place-order");
};

function toNullableString(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

// Sign in the user with credentials
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData,
) {
  try {
    const user = signInFormSchema.parse({
      email: String(formData.get("email")).toLowerCase(),
      password: formData.get("password"),
    });

    const result = await signIn("credentials", user);

    // console.log("✅ Sign in result:", result);

    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: "Invalid email or password" };
  }
}

// Sign Out the user
export async function SignOutUser() {
  await signOut();
}

// Sign Up the user with credentials
export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    const plainPassword = user.password;

    user.password = hashSync(user.password, 10);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    await signIn("credentials", {
      email: user.email,
      password: plainPassword,
    });

    return { success: true, message: "User registered successfully" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: formatError(error) };
  }
}

// Sign out the user
export async function signOutUser() {
  try {
    // Get current user's cart and delete it so it does not persist to next user
    const currentCart = await getMyCart();
    if (currentCart?.id) {
      await prisma.cart.delete({ where: { id: currentCart.id } });
    } else {
      console.warn("No cart found for deletion.");
    }
    await signOut();
  } catch (error) {
    throw new Error(formatError(error));
  }
}

// Get user by ID
export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            Order: true,
            Review: true,
            Cart: true,
          },
        },
        shippingAddresses: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        },
        selectedShippingAddress: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    throw new Error(formatError(error));
  }
}

// Update user address
export async function updateUserAddress(address: ShippingAddress) {
  return saveUserShippingAddress({
    ...address,
    label: address.label || "Home",
    isDefault: true,
  });
}

export async function saveUserShippingAddress(address: SavedShippingAddress) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, message: "User not found" };
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        shippingAddresses: true,
      },
    });

    if (!currentUser) {
      return { success: false, message: "User not found" };
    }

    const parsedAddress = saveShippingAddressSchema.parse(address);

    if (parsedAddress.id) {
      const existingAddress = currentUser.shippingAddresses.find(
        (item) => item.id === parsedAddress.id,
      );

      if (!existingAddress) {
        return { success: false, message: "Address not found" };
      }
    }

    const shouldBeDefault =
      parsedAddress.isDefault || currentUser.shippingAddresses.length === 0;

    const savedAddress = await prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.userShippingAddress.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      const addressData = {
        label: parsedAddress.label,
        fullName: parsedAddress.fullName,
        phone: toNullableString(parsedAddress.phone),
        streetAddress: parsedAddress.streetAddress,
        addressLine2: toNullableString(parsedAddress.addressLine2),
        city: parsedAddress.city,
        state: toNullableString(parsedAddress.state),
        postalCode: parsedAddress.postalCode,
        country: parsedAddress.country,
        deliveryInstructions: toNullableString(
          parsedAddress.deliveryInstructions,
        ),
        isDefault: shouldBeDefault,
      };

      const nextAddress = parsedAddress.id
        ? await tx.userShippingAddress.update({
            where: { id: parsedAddress.id },
            data: addressData,
          })
        : await tx.userShippingAddress.create({
            data: {
              userId,
              ...addressData,
            },
          });

      await tx.user.update({
        where: { id: userId },
        data: {
          selectedShippingAddressId: nextAddress.id,
          address: shippingAddressSchema.parse({
            label: nextAddress.label,
            fullName: nextAddress.fullName,
            phone: nextAddress.phone ?? "",
            streetAddress: nextAddress.streetAddress,
            addressLine2: nextAddress.addressLine2 ?? "",
            city: nextAddress.city,
            state: nextAddress.state ?? "",
            postalCode: nextAddress.postalCode,
            country: nextAddress.country,
            deliveryInstructions: nextAddress.deliveryInstructions ?? "",
          }),
        },
      });

      return nextAddress;
    });

    revalidateUserCheckoutPaths();

    return {
      success: true,
      message: parsedAddress.id
        ? "Address updated successfully"
        : "Address saved successfully",
      address: savedAddress,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function selectUserShippingAddress(addressId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, message: "User not found" };
    }

    const address = await prisma.userShippingAddress.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      return { success: false, message: "Address not found" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        selectedShippingAddressId: address.id,
        address: shippingAddressSchema.parse({
          label: address.label,
          fullName: address.fullName,
          phone: address.phone ?? "",
          streetAddress: address.streetAddress,
          addressLine2: address.addressLine2 ?? "",
          city: address.city,
          state: address.state ?? "",
          postalCode: address.postalCode,
          country: address.country,
          deliveryInstructions: address.deliveryInstructions ?? "",
        }),
      },
    });

    revalidateUserCheckoutPaths();

    return { success: true, message: "Shipping address selected" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function setDefaultUserShippingAddress(addressId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, message: "User not found" };
    }

    const address = await prisma.userShippingAddress.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      return { success: false, message: "Address not found" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.userShippingAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });

      await tx.userShippingAddress.update({
        where: { id: address.id },
        data: { isDefault: true },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          selectedShippingAddressId: address.id,
          address: shippingAddressSchema.parse({
            label: address.label,
            fullName: address.fullName,
            phone: address.phone ?? "",
            streetAddress: address.streetAddress,
            addressLine2: address.addressLine2 ?? "",
            city: address.city,
            state: address.state ?? "",
            postalCode: address.postalCode,
            country: address.country,
            deliveryInstructions: address.deliveryInstructions ?? "",
          }),
        },
      });
    });

    revalidateUserCheckoutPaths();

    return { success: true, message: "Default shipping address updated" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function deleteUserShippingAddress(addressId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, message: "User not found" };
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        shippingAddresses: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        },
      },
    });

    if (!currentUser) {
      return { success: false, message: "User not found" };
    }

    const address = currentUser.shippingAddresses.find(
      (item) => item.id === addressId,
    );

    if (!address) {
      return { success: false, message: "Address not found" };
    }

    const remainingAddresses = currentUser.shippingAddresses.filter(
      (item) => item.id !== addressId,
    );
    const nextAddress =
      remainingAddresses.find((item) => item.isDefault) ??
      remainingAddresses[0] ??
      null;

    await prisma.$transaction(async (tx) => {
      await tx.userShippingAddress.delete({
        where: { id: addressId },
      });

      if (nextAddress && !nextAddress.isDefault) {
        await tx.userShippingAddress.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          selectedShippingAddressId: nextAddress?.id ?? null,
          address: nextAddress
            ? shippingAddressSchema.parse({
                label: nextAddress.label,
                fullName: nextAddress.fullName,
                phone: nextAddress.phone ?? "",
                streetAddress: nextAddress.streetAddress,
                addressLine2: nextAddress.addressLine2 ?? "",
                city: nextAddress.city,
                state: nextAddress.state ?? "",
                postalCode: nextAddress.postalCode,
                country: nextAddress.country,
                deliveryInstructions: nextAddress.deliveryInstructions ?? "",
              })
            : Prisma.JsonNull,
        },
      });
    });

    revalidateUserCheckoutPaths();

    return { success: true, message: "Address removed" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update user payment method
export async function updateUserPaymentMethod(paymentMethod: PaymentMethod) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return { success: false, message: "User not found" };
    }

    const parsedPaymentMethod = paymentMethodSchema.parse(paymentMethod);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        paymentMethod: parsedPaymentMethod.type,
      },
    });

    return {
      success: true,
      message: "Payment method updated successfully",
      user: updatedUser,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update user profile
export async function updateUserProfile(profileData: {
  name: string;
  email: string;
}) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return { success: false, message: "User not found" };
    }

    const parsedProfileData = updateProfileSchema.parse(profileData);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: parsedProfileData.name,
      },
    });

    return {
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get All Users
// Get all the users
export async function getAllUsers({
  limit = DB_ADMIN_USERS_TAKE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query: string;
}) {
  // Helper function to check if string is a valid UUID
  const isValidUUID = (str: string) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const queryFilter: Prisma.UserWhereInput =
    query && query !== "all"
      ? {
          OR: [
            // Search in user name
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            // Search in user email
            {
              email: {
                contains: query,
                mode: "insensitive",
              },
            },
            // Search in user role (if exists)
            {
              role: {
                contains: query,
                mode: "insensitive",
              },
            },
            // Only search in ID if query is a valid UUID
            ...(isValidUUID(query)
              ? [
                  {
                    id: {
                      equals: query,
                    },
                  },
                ]
              : []),
            // Multiple word search (excluding UUID searches)
            ...query
              .split(" ")
              .filter((word) => word.length > 0)
              .map((word) => ({
                OR: [
                  {
                    name: {
                      contains: word,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    email: {
                      contains: word,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    role: {
                      contains: word,
                      mode: "insensitive" as const,
                    },
                  },
                ],
              })),
          ],
        }
      : {};

  const data = await prisma.user.findMany({
    where: queryFilter,
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.user.count({
    where: queryFilter,
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

//Delete User
export async function deleteUser(userId: string) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    if (currentUserId === userId) {
      return { success: false, message: "You cannot delete your own account" };
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update User
export async function updateUser(userData: {
  id: string;
  name?: string;
  email?: string;
  role?: string;
}) {
  try {
    const session = await auth();

    const isAdmin = session?.user?.role === "admin";

    if (!isAdmin) {
      return {
        success: false,
        message: "You are not authorized to update this user",
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userData.id },
      data: {
        name: userData.name,
        role: userData.role,
      },
    });

    revalidatePath("/admin/users");

    return {
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
