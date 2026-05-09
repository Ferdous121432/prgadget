import { z } from "zod";
import { PAYMENT_METHODS } from "./constants";
import {
  ORDER_FULFILLMENT_STATUSES,
  ORDER_PAYMENT_STATUSES,
} from "./order-status";
import { formatNumberWithDecimal } from "./utils";

const currency = z
  .string()
  .trim()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    "Price must have exactly two decimal places",
  );

const optionalCurrency = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine(
    (value) =>
      !value || /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    "Offer price must have exactly two decimal places",
  );

const productSpecificationField = z
  .string()
  .trim()
  .max(5000, "Must be 5000 characters or fewer")
  .optional()
  .or(z.literal(""));

const productShortDescriptionField = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""));

const productDescriptionField = z.string().trim().optional().or(z.literal(""));

export const productSpecificationsSchema = z.object({
  display: z.object({
    size: productSpecificationField,
    type: productSpecificationField,
    resolution: productSpecificationField,
    refreshRate: productSpecificationField,
    brightness: productSpecificationField,
    protection: productSpecificationField,
    features: productSpecificationField,
  }),
  processor: z.object({
    chipset: productSpecificationField,
    cpuType: productSpecificationField,
    gpu: productSpecificationField,
  }),
  memory: z.object({
    ram: productSpecificationField,
    rom: productSpecificationField,
  }),
  rearCamera: z.object({
    resolution: productSpecificationField,
    features: productSpecificationField,
    videoRecording: productSpecificationField,
  }),
  frontCamera: z.object({
    resolution: productSpecificationField,
    features: productSpecificationField,
  }),
  audio: z.object({
    speaker: productSpecificationField,
    audioFeatures: productSpecificationField,
  }),
  networkConnectivity: z.object({
    sim: productSpecificationField,
    network: productSpecificationField,
    wifi: productSpecificationField,
    bluetooth: productSpecificationField,
    gps: productSpecificationField,
    nfc: productSpecificationField,
    usb: productSpecificationField,
    otg: productSpecificationField,
    audioJack: productSpecificationField,
  }),
  os: z.object({
    operatingSystem: productSpecificationField,
  }),
  features: z.object({
    sensors: productSpecificationField,
    ipRating: productSpecificationField,
    otherFeatures: productSpecificationField,
  }),
  battery: z.object({
    type: productSpecificationField,
    fastCharging: productSpecificationField,
  }),
  physicalSpecification: z.object({
    dimension: productSpecificationField,
    weight: productSpecificationField,
    colors: productSpecificationField,
  }),
  warrantyInformation: z.object({
    warranty: productSpecificationField,
  }),
});

// MainCategory
export const createMainCategorySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  image: z.string(),
  image_key: z.string(),
});

export const updateMainCategorySchema = createMainCategorySchema.extend({
  id: z.string(),
});

// Brand
export const createBrandSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  image: z.string(),
  image_key: z.string(),
});

export const updateBrandSchema = createBrandSchema.extend({
  id: z.string(),
});

// SubCategory
export const createSubCategorySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  mainCategoryId: z.string().min(1, "Main category is required"),
});

export const updateSubCategorySchema = createSubCategorySchema.extend({
  id: z.string(),
});

// SubSubCategory
export const createSubSubCategorySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string(),
  subCategoryId: z.string(),
});

export const updateSubSubCategorySchema = createSubSubCategorySchema.extend({
  id: z.string(),
});

// category tag schema
export const categoryTagSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string(),
});

// Schema of Products for public use
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  mainCategory: z.string(),
  subCategory: z.string().optional().nullable(),
  subSubCategory: z.string().optional().nullable(),
  brand: z.string(),
  categoryTags: categoryTagSchema.array().optional(),
  shortDescription: z.string().optional().nullable(),
  description: z.string(),
  specifications: productSpecificationsSchema.optional().nullable(),
  price: currency,
  offerPrice: currency.optional().nullable(),
  stock: z.number(),
  rating: z.string().optional().nullable(),
  numReviews: z.number().optional().nullable(),
  images: z.array(z.string()),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

function validateOfferPrice(
  data: { price: string; offerPrice?: string | null },
  ctx: z.RefinementCtx,
) {
  if (!data.offerPrice) {
    return;
  }

  if (Number(data.offerPrice) >= Number(data.price)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["offerPrice"],
      message: "Offer price must be lower than regular price",
    });
  }
}

const productInputSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  mainCategoryId: z
    .string()
    .min(3, "Main category must be at least 3 characters"),
  subCategoryId: z.string().optional(),
  subSubCategoryId: z.string().optional(),
  brandId: z.string().optional().or(z.literal("")),
  categoryTags: z.array(z.string()).optional(),
  shortDescription: productShortDescriptionField,
  description: productDescriptionField,
  specifications: productSpecificationsSchema.optional(),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1, "Product must have at least one image"),
  image_keys: z
    .array(z.string())
    .min(1, "Product must have at least one image"),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currency,
  offerPrice: optionalCurrency,
});

// Schema for inserting products
export const insertProductSchema =
  productInputSchema.superRefine(validateOfferPrice);

// Schema for updating products
export const updateProductSchema = productInputSchema
  .extend({
    id: z.string().min(1, "Id is required"),
  })
  .superRefine(validateOfferPrice);

// Schema for products
export const productSchemaWithID = productInputSchema.extend({
  id: z.string().min(1, "Id is required"),
  rating: z.string().optional().nullable(),
  numReviews: z.number().optional().nullable(),
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
  sessionCartId: z
    .string()
    .min(1, "Session cart id is required")
    .optional()
    .nullable(),
  userId: z.string().optional().nullable(),
});

const optionalAddressField = z
  .string()
  .trim()
  .max(120, "Must be 120 characters or fewer")
  .optional()
  .or(z.literal(""));

const optionalPhoneField = z
  .string()
  .trim()
  .max(20, "Phone number must be 20 characters or fewer")
  .optional()
  .or(z.literal(""))
  .refine(
    (value) => !value || value.length >= 7,
    "Phone number must be at least 7 characters",
  );

const shippingAddressLabelSchema = z
  .string()
  .trim()
  .min(2, "Label must be at least 2 characters")
  .max(40);

// Schema for the shipping address
export const shippingAddressSchema = z.object({
  label: shippingAddressLabelSchema.optional().or(z.literal("")),
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  phone: optionalPhoneField,
  streetAddress: z.string().min(3, "Address must be at least 3 characters"),
  addressLine2: optionalAddressField,
  city: z.string().min(3, "City must be at least 3 characters"),
  state: optionalAddressField,
  postalCode: z.string().min(3, "Postal code must be at least 3 characters"),
  country: z.string().min(3, "Country must be at least 3 characters"),
  deliveryInstructions: z
    .string()
    .trim()
    .max(300, "Delivery instructions must be 300 characters or fewer")
    .optional()
    .or(z.literal("")),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const saveShippingAddressSchema = shippingAddressSchema.extend({
  label: shippingAddressLabelSchema,
  id: z.string().optional(),
  isDefault: z.boolean().optional(),
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
  paymentStatus: z.enum(ORDER_PAYMENT_STATUSES).optional(),
  fulfillmentStatus: z.enum(ORDER_FULFILLMENT_STATUSES).optional(),
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
  paymentStatus: z.enum(ORDER_PAYMENT_STATUSES),
  fulfillmentStatus: z.enum(ORDER_FULFILLMENT_STATUSES),
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
  phone: optionalPhoneField,
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

export const FeaturedCategoriesSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  image: z.string(),
});

// Category tag type
export const CreateCategoryTagSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string(),
  subCategoryId: z.string().optional(),
  createdAt: z.date().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
  id: z.string().optional().nullable(),
});
