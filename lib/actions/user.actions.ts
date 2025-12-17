"use server";

import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/db/prisma";
import {
  paymentMethodSchema,
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
  updateProfileSchema,
} from "@/lib/validators";
import { PaymentMethod, ShippingAddress } from "@/types";
import { hashSync } from "bcrypt-ts-edge";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { DB_ADMIN_USERS_TAKE } from "../constants";
import { Prisma } from "../generated/prisma";
import { formatError } from "../utils";
import { getMyCart } from "./cart.actions";

// Sign in the user with credentials
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
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
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return { success: false, message: "User not found" };
    }

    const parsedAddress = shippingAddressSchema.parse(address);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        address: parsedAddress,
      },
    });

    return {
      success: true,
      message: "Address updated successfully",
      user: updatedUser,
    };
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
