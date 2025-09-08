import { z } from "zod";
import { formatNumberWithDecimal } from "./utils";
import { PAYMENT_METHODS } from "./constants";

const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    "Price must have exactly two decimal places"
  );

// MainCategory
export const createMainCategorySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  image: z.string().optional(),
  image_key: z.string().optional(),
});

export const updateMainCategorySchema = createMainCategorySchema.extend({
  id: z.string(),
});

// SubCategory
export const createSubCategorySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  mainCategoryId: z.string(),
});

export const updateSubCategorySchema = createSubCategorySchema.extend({
  id: z.string(),
});

// SubSubCategory
export const createSubSubCategorySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  subCategoryId: z.string(),
});

export const updateSubSubCategorySchema = createSubSubCategorySchema.extend({
  id: z.string(),
});

// Schema for inserting products
export const insertProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  mainCategoryId: z
    .string()
    .min(3, "Main category must be at least 3 characters"),
  subCategoryId: z
    .string()
    .min(3, "Sub category must be at least 3 characters"),
  subSubCategoryId: z
    .string()
    .min(3, "Sub sub category must be at least 3 characters"),
  brand: z.string().min(3, "Brand must be at least 3 characters"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1, "Product must have at least one image"),
  image_keys: z
    .array(z.string())
    .min(1, "Product must have at least one image"),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currency,
});

// Schema for updating products
export const updateProductSchema = insertProductSchema.extend({
  id: z.string().min(1, "Id is required"),
  rating: z.string().optional(),
  numReviews: z.number().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Schema for signing users in
export const signInFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Schema for signing up a user
export const signUpFormSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Cart Schemas
export const cartItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  quantity: z.number().int().nonnegative("Quantity must be a positive number"),
  image: z.string().min(1, "Image is required"),
  price: currency,
});

export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  sessionCartId: z.string().min(1, "Session cart id is required"),
  userId: z.string().optional().nullable(),
});

// Schema for the shipping address
export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  streetAddress: z.string().min(3, "Address must be at least 3 characters"),
  city: z.string().min(3, "City must be at least 3 characters"),
  postalCode: z.string().min(3, "Postal code must be at least 3 characters"),
  country: z.string().min(3, "Country must be at least 3 characters"),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

// Schema for inserting an order item
export const insertOrderItemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  image: z.string(),
  name: z.string(),
  price: currency,
  quantity: z.number(),
});

// Schema for payment method
export const paymentMethodSchema = z
  .object({
    type: z.string().min(1, "Payment method is required"),
  })
  .refine((data) => PAYMENT_METHODS.includes(data.type), {
    path: ["type"],
    message: "Invalid payment method",
  });

// Schema for payment result
export const paymentResultSchema = z.object({
  id: z.string().min(1, "Payment ID is required"),
  status: z.string().min(1, "Status is required"),
  update_time: z.string().optional(),
  email_address: z.string().email("Invalid email address").optional(),
  pricePaid: currency,
});

/// Schema for inserting order
export const insertOrderSchema = z.object({
  userId: z.string().min(1, "User is required"),
  itemsPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  totalPrice: currency,
  paymentMethod: z.string().refine((data) => PAYMENT_METHODS.includes(data), {
    message: "Invalid payment method",
  }),
  shippingAddress: shippingAddressSchema,
  isPaid: z.boolean().optional(),
  paidAt: z.string().optional(),
  isDelivered: z.boolean().optional(),
  deliveredAt: z.string().optional(),
});

// Schema for updating an order
export const updateOrderSchema = insertOrderSchema.extend({
  id: z.string().min(1, "ID is required"),
  createdAt: z.string(), // Use z.string() for ISO date, or z.date() if you want Date objects
  isPaid: z.boolean(),
  paidAt: z.date().nullable().optional(),
  isDelivered: z.boolean(),
  deliveredAt: z.date().nullable().optional(),
  orderItems: z.array(insertOrderItemSchema),
  user: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
  paymentResult: paymentResultSchema,
});

// Schema for updating the user profile
export const updateProfileSchema = z.object({
  name: z.string().min(3, "Name must be at leaast 3 characters"),
  email: z.string().min(3, "Email must be at leaast 3 characters"),
});

// Schema to update users
export const updateUserSchema = updateProfileSchema.extend({
  id: z.string().min(1, "ID is required"),
  role: z.string().min(1, "Role is required"),
});

// Schema to insert reviews
export const insertReviewSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  productId: z.string().min(1, "Product is required"),
  userId: z.string().min(1, "User is required"),
  user: z.object({
    name: z.string(),
    id: z.string(),
  }),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
});

// Schema to update reviews
export const updateReviewSchema = insertReviewSchema.extend({
  id: z.string().min(1, "ID is required"),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
});

export const sliderFormSchema = z.object({
  image_url: z.string().min(1, "Image is required"),
  linked_url: z.string().min(1, "Linked URL is required"),
  image_name: z.string().min(1, "Image name is required"),
  image_key: z.string().min(1, "Image key is required"),
  createdAt: z.date().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
  id: z.string().optional().nullable(),
});

export const sessionUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  avatar: z.string(),
});
