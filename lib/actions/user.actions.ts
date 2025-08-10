"use server";

import {
  paymentMethodSchema,
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
} from "@/lib/validators";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { auth, signIn, signOut } from "@/auth";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import { formatError } from "../utils";
import { PaymentMethod, ShippingAddress } from "@/types";

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
