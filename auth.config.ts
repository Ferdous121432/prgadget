import GoogleProvider from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
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
        return false;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
