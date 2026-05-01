import logo from "@/public/assets/images/logo.png";

import accessories from "@/public/assets/category-logo/accessories.png";
import earphone from "@/public/assets/category-logo/earphone.png";
import laptop from "@/public/assets/category-logo/mackbook.png";
import phones from "@/public/assets/category-logo/phone.png";
import powerbank from "@/public/assets/category-logo/powerbank.png";
import speaker from "@/public/assets/category-logo/speaker.png";
import tablet from "@/public/assets/category-logo/tablet.png";
import watch from "@/public/assets/category-logo/watch.png";

import apple from "@/public/assets/brand-logo/apple.png";
import honor from "@/public/assets/brand-logo/honor-aas.png";
import infinix from "@/public/assets/brand-logo/infinix434.png";
import oneplus from "@/public/assets/brand-logo/oneplus-aas.png";
import oppo from "@/public/assets/brand-logo/oppo-aas.png";
import realme from "@/public/assets/brand-logo/realme-aas.png";
import samsung from "@/public/assets/brand-logo/samsung-aas.png";
import vivo from "@/public/assets/brand-logo/vivo-aas.png";

export const APP_Name = "PRGadget";
export const APP_NAME = "PRGadget";
export const APP_LOGO = logo;

export const APP_DESCRIPTION = "A modern ecommerce store built with Next.js";
// export const SERVER_URL =
//   process.env.NEXT_PUBLIC_SERVER_URL || "https://prgt.firdous.pro";
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

// Frontend Query Limits
export const LATEST_PRODUCTS_LIMIT = 6;
export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 12;

// DB Query Limits
export const DB_LATEST_SALES_TAKE = 10;
export const DB_ADMIN_PRODUCT_TAKE = 10;
export const DB_ADMIN_USERS_TAKE = 10;

export const signInDefaultValues = {
  email:
    process.env.NODE_ENV === "development"
      ? "admin@example.com"
      : "admin@example.com",
  password: process.env.NODE_ENV === "development" ? "123456" : "123456",
};

export const signUpDefaultValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const shippingAddressDefaultValues = {
  label: "Home",
  fullName: "Firdous",
  phone: "",
  streetAddress: "123 Main St",
  addressLine2: "",
  city: " Dinajpur",
  state: "",
  postalCode: "5200",
  country: "Bangladesh",
  deliveryInstructions: "",
  isDefault: true,
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
  brandId: "",
  description: "lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  price: "66.99",
  stock: 10,
  rating: "4.5",
  numReviews: "4",
  isFeatured: false,
  banner: null,
};

export const mainCategoryDefaultValues = {
  name: "Formal",
  slug: "",
  image: "",
  image_key: "<image_key>",
};

export const categoryTagDefaultValues = {
  name: "Casual",
  slug: "",
};

export const USER_ROLES = process.env.USER_ROLES
  ? process.env.USER_ROLES.split(", ")
  : ["admin", "user"];

export const reviewFormDefaultValues = {
  title: "Review test",
  comment: "lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  rating: 4,
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

// Product Categories
export const PRODUCT_CATEGORIES = [
  "Shirts",
  "Pants",
  "Jeans",
  "T-Shirts",
  "Jackets",
  "Shoes",
  "Hats",
  "Accessories",
];

export const categories = [
  {
    id: 1,
    name: "Phones",
    url: `phones`,
  },
  {
    id: 2,
    name: "Phone Accessories",
    url: `phone-accessories`,
  },
  {
    id: 3,
    name: "Tablet",
    url: `tablet`,
  },
  {
    id: 4,
    name: "Watches",
    url: `watches`,
  },
  {
    id: 5,
    name: "Headphones & Earphones",
    url: `headphones-earphones`,
  },
  {
    id: 6,
    name: "PC Accessories",
    url: `pc-accessories`,
  },
  {
    id: 7,
    name: "Gadgets",
    url: `gadgets`,
  },
  {
    id: 8,
    name: "sales",
    url: `sales`,
  },
];

export const featuredCategoryLogos = [
  {
    id: 1,
    name: "phones",
    link: "phones",
    image: phones,
  },
  {
    id: 2,
    name: "earphones",
    link: "headphones-earphones",
    image: earphone,
  },
  {
    id: 3,
    name: "accessories",
    link: "phone-accessories",
    image: accessories,
  },
  {
    id: 4,
    name: "powerbank",
    link: "powerbank",
    image: powerbank,
  },
  {
    id: 5,
    name: "tablet",
    link: "tablet",
    image: tablet,
  },
  {
    id: 6,
    name: "watches",
    link: "watches",
    image: watch,
  },
  {
    id: 7,
    name: "speaker",
    link: "Headphones & Earphones",
    image: speaker,
  },
  {
    id: 8,
    name: "laptop",
    link: "laptop",
    image: laptop,
  },
];

export const featuredBrands = [
  {
    id: 1,
    name: "Apple",
    link: "apple",
    image: apple,
  },
  {
    id: 2,
    name: "Samsung",
    link: "samsung",
    image: samsung,
  },
  {
    id: 3,
    name: "Honor",
    link: "honor",
    image: honor,
  },
  {
    id: 4,
    name: "OnePlus",
    link: "oneplus",
    image: oneplus,
  },
  {
    id: 5,
    name: "Oppo",
    link: "oppo",
    image: oppo,
  },
  {
    id: 6,
    name: "Realme",
    link: "realme",
    image: realme,
  },
  {
    id: 7,
    name: "Infinix",
    link: "infinix",
    image: infinix,
  },
  {
    id: 8,
    name: "Vivo",
    link: "vivo",
    image: vivo,
  },
];
