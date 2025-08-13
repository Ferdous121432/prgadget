"use server";

import {
  paymentMethodSchema,
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
  updateProfileSchema,
} from "@/lib/validators";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { auth, signIn, signOut } from "@/auth";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import { formatError } from "../utils";
import { PaymentMethod, ShippingAddress } from "@/types";
import { getMyCart } from "./cart.actions";

// Sign in the user with credentials
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", user);

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
