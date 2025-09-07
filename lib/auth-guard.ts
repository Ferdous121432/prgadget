import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAuth(currentPath?: string) {
  const session = await auth();

  if (!session?.user) {
    // Use the provided path or fallback to "/"
    const callbackUrl = encodeURIComponent(currentPath || "/");
    redirect(`/login?callbackUrl=${callbackUrl}`);
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

export async function requireAdmin(currentPath?: string) {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  if (!session?.user) {
    // Use the provided path or fallback to "/"
    const callbackUrl = encodeURIComponent(currentPath || "/");
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }

  if (!isAdmin) {
    // Redirect non-admin users to the home page
    redirect("/unauthorized");
  }

  return session;
}
