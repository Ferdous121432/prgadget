import { PrismaClient } from "@/lib/generated/prisma";
// import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

// Sets up WebSocket connections, which enables Neon to use WebSocket communication.
neonConfig.webSocketConstructor = ws;

// Create the adapter with connection string
const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

// Extends the PrismaClient with a custom result transformer to convert the price and rating fields to strings.
export const prisma = new PrismaClient({ adapter }).$extends({
  result: {
    product: {
      price: {
        compute(product: { price: number }) {
          return product.price.toString();
        },
      },
      rating: {
        compute(product: { rating: number }) {
          return product.rating.toString();
        },
      },
    },
    cart: {
      itemsPrice: {
        needs: { itemsPrice: true },
        compute(cart: { itemsPrice: number }) {
          return cart.itemsPrice.toString();
        },
      },
      shippingPrice: {
        needs: { shippingPrice: true },
        compute(cart: { shippingPrice: number }) {
          return cart.shippingPrice.toString();
        },
      },
      taxPrice: {
        needs: { taxPrice: true },
        compute(cart: { taxPrice: number }) {
          return cart.taxPrice.toString();
        },
      },
      totalPrice: {
        needs: { totalPrice: true },
        compute(cart: { totalPrice: number }) {
          return cart.totalPrice.toString();
        },
      },
    },
    orderItem: {
      price: {
        needs: { price: true },
        compute(orderItem: { price: number }) {
          return orderItem.price.toString();
        },
      },
    },
  },
});
