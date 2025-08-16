import {
  cartItemSchema,
  insertCartSchema,
  insertOrderItemSchema,
  insertOrderSchema,
  insertProductSchema,
  insertReviewSchema,
  paymentMethodSchema,
  paymentResultSchema,
  shippingAddressSchema,
  updateProductSchema,
  updateProfileSchema,
} from "@/lib/validators";
import { z } from "zod";

//Product
export type Product = z.infer<typeof insertProductSchema> & {
  id?: string;
  rating?: string;
  numReviews?: number;
  createdAt?: Date;
};

export type ProductSchema = z.infer<typeof insertProductSchema>;
export type ProductWithId = z.infer<typeof updateProductSchema>;

// Cart
export type Cart = z.infer<typeof insertCartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;

//Order
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type OrderItem = z.infer<typeof insertOrderItemSchema>;
export type Order = z.infer<typeof insertOrderSchema> & {
  id: string;
  createdAt: Date;
  isPaid: boolean;
  paidAt: Date | null;
  isDelivered: boolean;
  deliveredAt: Date | null;
  orderItems: OrderItem[];
  user: { name: string; email: string };
  paymentResult: PaymentResult;
};
export type PaymentResult = z.infer<typeof paymentResultSchema>;
export type Review = z.infer<typeof insertReviewSchema> & {
  id: string;
  createdAt: Date;
  user?: { name: string };
};

// User
export type UpdateUserProfile = z.infer<typeof updateProfileSchema>;

// Admin

export type SalesData = {
  month: string;
  totalSales: number;
}[];

export type Categories = {
  category: string;
  count: number;
}[];
