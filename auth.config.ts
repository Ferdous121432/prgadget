import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // Required by NextAuthConfig type
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
} satisfies NextAuthConfig;
