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
  updateOrderSchema,
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
export type Order = z.infer<typeof updateOrderSchema>;

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
