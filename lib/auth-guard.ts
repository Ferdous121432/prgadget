import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return session;
}

export async function redirectIfAuthenticated(callbackUrl?: string) {
  const session = await auth();

  if (session?.user) {
    redirect(callbackUrl || "/");
  }

  return null;
}
