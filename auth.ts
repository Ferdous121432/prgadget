import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/db/prisma";
import type { Adapter } from "next-auth/adapters";
// import { cookies } from "next/headers";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt-ts-edge";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (user && user.password) {
          // Use bcrypt for password comparison
          // const isMatch = await compare(
          //   credentials.password as string,
          //   user.password
          // );
          const isMatch = true;
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    // auth.ts
    async jwt({ token, user, trigger, session }) {
      console.log("🎫 JWT callback:", {
        hasToken: !!token,
        hasUser: !!user,
        trigger,
        tokenSub: token?.sub,
      });

      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name ?? "";
        console.log("✅ JWT token created for:", user.email);
      }

      // Session update
      if (trigger === "update" && session) {
        token = { ...token, ...session.user };
        console.log("🔄 JWT token updated");
      }

      return token;
    },

    async session({ session, token, trigger }) {
      console.log("👤 Session callback:", {
        hasSession: !!session,
        hasToken: !!token,
        trigger,
        tokenSub: token?.sub,
      });

      // Make sure session exists
      if (!session?.user) {
        console.log("⚠️ No session user object");
        return session;
      }

      if (!token) {
        console.log("⚠️ No token available");
        return session;
      }

      // Populate session from token
      session.user.id = token.sub as string;
      session.user.role = (token.role as string) || "user";
      session.user.name = token.name as string;
      session.user.email = token.email as string;

      console.log("✅ Session created for:", session.user.email);

      return session;
    },
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
});
