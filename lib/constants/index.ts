import logo from "@/public/assets/images/logo.png";
export const APP_Name = "PRGadget";
export const APP_NAME = "PRGadget";
export const APP_LOGO = logo;

export const APP_DESCRIPTION = "A modern ecommerce store built with Next.js";
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "https://prgadget.vercel.app";
export const LATEST_PRODUCTS_LIMIT = 10;
export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 12;
export const DB_LATEST_SALES_TAKE = 10;
export const DB_ADMIN_PRODUCT_TAKE = 1;
export const DB_ADMIN_USERS_TAKE = 10;

export const signInDefaultValues = {
  email: process.env.NODE_ENV === "development" ? "admin@example.com" : "",
  password: process.env.NODE_ENV === "development" ? "123456" : "",
};

export const signUpDefaultValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const shippingAddressDefaultValues = {
  fullName: "Firdous",
  streetAddress: "123 Main St",
  city: " Dinajpur",
  postalCode: "5200",
  country: "Bangladesh",
};

export const PAYMENT_METHODS = process.env.PAYMENT_METHODS
  ? process.env.PAYMENT_METHODS.split(", ")
  : ["PayPal", "Stripe", "CashOnDelivery"];
export const DEFAULT_PAYMENT_METHOD =
  process.env.DEFAULT_PAYMENT_METHOD || "PayPal";

export const productDefaultValues = {
  name: "Shirt Formal",
  slug: "",
  category: "shirt",
  images: [],
  brand: "catseye",
  description: "lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  price: "66.99",
  stock: 10,
  rating: "4.5",
  numReviews: "4",
  isFeatured: false,
  banner: null,
};

export const USER_ROLES = process.env.USER_ROLES
  ? process.env.USER_ROLES.split(", ")
  : ["admin", "user"];

export const reviewFormDefaultValues = {
  title: "",
  comment: "",
  rating: 0,
};

export const SENDER_EMAIL = process.env.SENDER_EMAIL || "onboarding@resend.dev";

// DB Monthly Sales Query
export const MONTHLY_SALES_QUERY = ` 
SELECT 
to_char("createdAt", 'MM-YYYY') as month, 
sum("totalPrice") as totalSales 
FROM "Order" 
GROUP BY to_char("createdAt", 'MM-YYYY')
ORDER BY month`;
