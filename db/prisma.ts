import { PrismaClient } from "@/lib/generated/prisma";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Sets up WebSocket connections, which enables Neon to use WebSocket communication.
neonConfig.webSocketConstructor = ws;

// Check if we're in a build environment and handle accordingly
const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

// Create a singleton instance of PrismaClient
declare global {
  var __prisma: PrismaClient | undefined;
}

// Extends the PrismaClient with a custom result transformer to convert the price and rating fields to strings.
export const prisma =
  globalThis.__prisma ??
  new PrismaClient().$extends({
    result: {
      product: {
        price: {
          compute(product) {
            return product.price.toString();
          },
        },
        rating: {
          compute(product) {
            return product.rating.toString();
          },
        },
      },
    },
  });

// Store the client in global scope during development to prevent multiple instances
if (isDevelopment && !globalThis.__prisma) {
  globalThis.__prisma = prisma as any;
}
