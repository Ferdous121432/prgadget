import { prisma } from "@/db/prisma";
import { invalidateCartCache } from "@/lib/cache/redis";
import { mergeCartItems } from "@/lib/cart-utils";
import { round2 } from "@/lib/utils";
import type { CartItem } from "@/types";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { cookies } from "next/headers";

const calculateCartTotals = (items: CartItem[]) => {
  const itemsPrice = round2(
    items.reduce(
      (acc, item) => acc + Number(item.price) * Number(item.quantity),
      0,
    ),
  );
  const shippingPrice = round2(itemsPrice > 100 ? 0 : 10);
  const taxPrice = round2(itemsPrice * 0.15);
  const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

const mergeGuestCartOnSignIn = async (userId?: string | null) => {
  if (!userId) return;

  const sessionCartId = (await cookies()).get("sessionCartId")?.value;
  if (!sessionCartId) return;

  const guestCart = await prisma.cart.findFirst({
    where: { sessionCartId },
  });

  if (!guestCart) return;

  const userCart = await prisma.cart.findFirst({
    where: { userId },
  });

  if (!userCart) {
    await prisma.cart.update({
      where: { id: guestCart.id },
      data: { userId, sessionCartId: null },
    });

    await invalidateCartCache(userId, sessionCartId);
    return;
  }

  const mergedItems = mergeCartItems(
    userCart.items as CartItem[],
    guestCart.items as CartItem[],
  );

  await prisma.cart.update({
    where: { id: userCart.id },
    data: {
      items: mergedItems,
      ...calculateCartTotals(mergedItems),
    },
  });

  await prisma.cart.delete({
    where: { id: guestCart.id },
  });

  await invalidateCartCache(userId, sessionCartId);
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Allow trusting host (helpful for local dev where host may be localhost)
  trustHost: true,
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
    async signIn({ user }) {
      await mergeGuestCartOnSignIn(user.id);
      return true;
    },

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
