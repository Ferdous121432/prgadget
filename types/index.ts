import {
  cartItemSchema,
  createBrandSchema,
  CreateCategoryTagSchema,
  createMainCategorySchema,
  createSubCategorySchema,
  createSubSubCategorySchema,
  FeaturedCategoriesSchema,
  insertCartSchema,
  insertOrderItemSchema,
  insertProductSchema,
  paymentMethodSchema,
  paymentResultSchema,
  productSchema,
  productSchemaWithID,
  productSpecificationsSchema,
  saveShippingAddressSchema,
  sessionUserSchema,
  shippingAddressSchema,
  sliderFormSchema,
  updateBrandSchema,
  updateMainCategorySchema,
  updateOrderSchema,
  updateProductSchema,
  updateProfileSchema,
  updateReviewSchema,
  updateSubCategorySchema,
  updateSubSubCategorySchema,
} from "@/lib/validators";
import { z } from "zod";

//Product
export type Product = z.infer<typeof insertProductSchema> & {
  id?: string;
  rating?: string;
  numReviews?: number;
  createdAt?: Date;
};

export type ProductSchemaPublic = z.infer<typeof productSchema>;
export type ProductSchema = z.infer<typeof insertProductSchema>;
export type ProductWithId = z.infer<typeof updateProductSchema>;
export type ProductWithIds = z.infer<typeof productSchemaWithID>;
export type ProductSpecifications = z.infer<typeof productSpecificationsSchema>;
export type Review = z.infer<typeof updateReviewSchema>;

// Cart
export type Cart = z.infer<typeof insertCartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;

//Order
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type SavedShippingAddress = z.infer<typeof saveShippingAddressSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type OrderItem = z.infer<typeof insertOrderItemSchema>;
export type Order = z.infer<typeof updateOrderSchema>;
export type PaymentResult = z.infer<typeof paymentResultSchema>;
export type SliderFormValues = z.infer<typeof sliderFormSchema>;

// Category
export type CreateMainCategory = z.infer<typeof createMainCategorySchema>;
export type UpdateMainCategory = z.infer<typeof updateMainCategorySchema>;
export type CreateBrand = z.infer<typeof createBrandSchema>;
export type UpdateBrand = z.infer<typeof updateBrandSchema>;
export type CreateSubCategory = z.infer<typeof createSubCategorySchema>;
export type UpdateSubCategory = z.infer<typeof updateSubCategorySchema>;
export type CreateSubSubCategory = z.infer<typeof createSubSubCategorySchema>;
export type UpdateSubSubCategory = z.infer<typeof updateSubSubCategorySchema>;
export type FeaturedCategories = z.infer<typeof FeaturedCategoriesSchema>;
export type CreateCategoryTag = z.infer<typeof CreateCategoryTagSchema>;

// User
export type UpdateUserProfile = z.infer<typeof updateProfileSchema>;
export type SessionUser = z.infer<typeof sessionUserSchema>;

// Admin

export type SalesData = {
  month: string;
  totalSales: number;
}[];

export type Categories = {
  category: string;
  count: number;
}[];
