import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // Required by NextAuthConfig type
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnProtectedPage = [
        "/shipping-address",
        "/payment-method",
        "/place-order",
        "/user/",
        "/order/",
        "/admin",
        "/profile",
      ].some((path) => nextUrl.pathname.startsWith(path));

      if (isOnProtectedPage) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
