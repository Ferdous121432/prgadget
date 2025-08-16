"use server";

import { prisma } from "@/db/prisma";
import { DB_ADMIN_PRODUCT_TAKE, LATEST_PRODUCTS_LIMIT } from "../constants";
// import { PrismaClient } from "../generated/prisma";

import { convertPrismaObjectToJSObject } from "../utils";
import { revalidatePath } from "next/cache";
import { Product, ProductWithId } from "@/types";
import { success } from "zod";
import { Prisma } from "../generated/prisma";

// Get latest products

export async function getLatestProducts() {
  // const prisma = new PrismaClient();

  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: {
      createdAt: "desc",
    },
  });
  return convertPrismaObjectToJSObject(data);
}

//Get single product by slug
export async function getProductBySlug(slug: string) {
  // const prisma = new PrismaClient();

  const data = await prisma.product.findFirst({
    where: {
      slug,
    },
  });
  return convertPrismaObjectToJSObject(data);
}

// Get all products with pagination and search
// Get all products
export async function getAllProducts({
  query,
  limit = DB_ADMIN_PRODUCT_TAKE,
  page,
  category,
  price,
  rating,
  sort,
}: {
  query: string;
  limit?: number;
  page: number;
  category?: string;
  price?: string;
  rating?: string;
  sort?: string;
}) {
  // If no query, use simple filtering
  if (!query || query === "all") {
    const categoryFilter = category && category !== "all" ? { category } : {};
    const priceFilter: Prisma.ProductWhereInput =
      price && price !== "all"
        ? {
            price: {
              gte: Number(price.split("-")[0]),
              lte: Number(price.split("-")[1]),
            },
          }
        : {};
    const ratingFilter =
      rating && rating !== "all"
        ? {
            rating: {
              gte: Number(rating),
            },
          }
        : {};

    const data = await prisma.product.findMany({
      where: {
        ...categoryFilter,
        ...priceFilter,
        ...ratingFilter,
      },
      orderBy:
        sort === "lowest"
          ? { price: "asc" }
          : sort === "highest"
          ? { price: "desc" }
          : sort === "rating"
          ? { rating: "desc" }
          : { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const dataCount = await prisma.product.count({
      where: {
        ...categoryFilter,
        ...priceFilter,
        ...ratingFilter,
      },
    });

    return {
      data,
      totalPages: Math.ceil(dataCount / limit),
    };
  }

  // For search queries, use raw SQL with relevance scoring
  const searchTerms = query.split(" ").filter((term) => term.length > 0);
  const searchPattern = searchTerms.join(" | ");

  // Category filter
  const categoryCondition =
    category && category !== "all" ? `AND category = '${category}'` : "";

  // Price filter
  // Price filter (supports multiple ranges, e.g. "10-20,30-40")
  let priceCondition = "";
  if (price && price !== "all") {
    const ranges = price.split(",").map((range) => range.trim());
    if (ranges.length > 1) {
      const conditions = ranges
        .map((range) => {
          const [min, max] = range.split("-").map(Number);
          if (!isNaN(min) && !isNaN(max)) {
            return `(price BETWEEN ${min} AND ${max})`;
          }
          return "";
        })
        .filter(Boolean);
      if (conditions.length > 0) {
        priceCondition = `AND (${conditions.join(" OR ")})`;
      }
    } else {
      const [min, max] = ranges[0].split("-").map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        priceCondition = `AND price BETWEEN ${min} AND ${max}`;
      }
    }
  }

  // Rating filter
  const ratingCondition =
    rating && rating !== "all" ? `AND rating >= ${Number(rating)}` : "";

  // Raw SQL query with relevance scoring
  const relevanceQuery = `
    SELECT *,
      (
        -- Exact match in name (highest score)
        CASE WHEN LOWER(name) = LOWER($1) THEN 100 ELSE 0 END +
        
        -- Name starts with query (high score)
        CASE WHEN LOWER(name) LIKE LOWER($1 || '%') THEN 50 ELSE 0 END +
        
        -- Name contains full query (medium score)
        CASE WHEN LOWER(name) LIKE LOWER('%' || $1 || '%') THEN 25 ELSE 0 END +
        
        -- Brand exact match
        CASE WHEN LOWER(brand) = LOWER($1) THEN 40 ELSE 0 END +
        
        -- Brand contains query
        CASE WHEN LOWER(brand) LIKE LOWER('%' || $1 || '%') THEN 20 ELSE 0 END +
        
        -- Description contains query (lower score)
        CASE WHEN LOWER(description) LIKE LOWER('%' || $1 || '%') THEN 10 ELSE 0 END +
        
        -- Individual word matches
        ${searchTerms
          .map(
            (_, index) => `
        CASE WHEN LOWER(name) LIKE LOWER('%' || $${
          index + 2
        } || '%') THEN 5 ELSE 0 END +
        CASE WHEN LOWER(brand) LIKE LOWER('%' || $${
          index + 2
        } || '%') THEN 3 ELSE 0 END +
        CASE WHEN LOWER(description) LIKE LOWER('%' || $${
          index + 2
        } || '%') THEN 1 ELSE 0 END
        `
          )
          .join(" +")}
      ) as relevance_score
    FROM "Product"
    WHERE (
      LOWER(name) LIKE LOWER('%' || $1 || '%') OR
      LOWER(brand) LIKE LOWER('%' || $1 || '%') OR
      LOWER(description) LIKE LOWER('%' || $1 || '%')
      ${searchTerms
        .map(
          (_, index) => `
      OR LOWER(name) LIKE LOWER('%' || $${index + 2} || '%')
      OR LOWER(brand) LIKE LOWER('%' || $${index + 2} || '%')
      OR LOWER(description) LIKE LOWER('%' || $${index + 2} || '%')
      `
        )
        .join("")}
    )
    ${categoryCondition}
    ${priceCondition}
    ${ratingCondition}
    ORDER BY 
      relevance_score DESC,
      ${
        sort === "lowest"
          ? "price ASC"
          : sort === "highest"
          ? "price DESC"
          : sort === "rating"
          ? "rating DESC"
          : '"createdAt" DESC'
      }
    LIMIT $${searchTerms.length + 2}
    OFFSET $${searchTerms.length + 3}
  `;

  const data = await prisma.$queryRawUnsafe(
    relevanceQuery,
    query,
    ...searchTerms,
    limit,
    (page - 1) * limit
  );

  // Count query for pagination
  const countQuery = `
    SELECT COUNT(*) as total
    FROM "Product"
    WHERE (
      LOWER(name) LIKE LOWER('%' || $1 || '%') OR
      LOWER(brand) LIKE LOWER('%' || $1 || '%') OR
      LOWER(description) LIKE LOWER('%' || $1 || '%')
      ${searchTerms
        .map(
          (_, index) => `
      OR LOWER(name) LIKE LOWER('%' || $${index + 2} || '%')
      OR LOWER(brand) LIKE LOWER('%' || $${index + 2} || '%')
      OR LOWER(description) LIKE LOWER('%' || $${index + 2} || '%')
      `
        )
        .join("")}
    )
    ${categoryCondition}
    ${priceCondition}
    ${ratingCondition}
  `;

  const countResult = (await prisma.$queryRawUnsafe(
    countQuery,
    query,
    ...searchTerms
  )) as Array<{ total: bigint }>;

  const dataCount = Number(countResult[0]?.total || 0);

  return {
    data: convertPrismaObjectToJSObject(data),
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Delete product by ID
export async function deleteProduct(id: string) {
  try {
    const productExists = await prisma.product.findUnique({
      where: {
        id,
      },
    });
    if (!productExists) {
      return { success: false, message: "Product not found." };
    }

    const data = await prisma.product.delete({
      where: {
        id,
      },
    });

    revalidatePath("/admin/products");

    return { success: true, message: "Product deleted successfully." };
  } catch (error) {
    return { success: false, message: "Failed to delete product." };
  }
}

//Create a new product
export async function createProduct(data: Product) {
  try {
    const product = await prisma.product.create({
      data,
    });

    revalidatePath("/admin/products");

    return { success: true, message: "Product created successfully." };
  } catch (error) {
    return { success: false, message: "Failed to create product." };
  }
}

// Update product by ID
export async function updateProduct(data: ProductWithId) {
  try {
    const productExists = await prisma.product.findUnique({
      where: {
        id: data.id,
      },
    });
    if (!productExists) {
      return { success: false, message: "Product not found." };
    }

    const updatedProduct = await prisma.product.update({
      where: {
        id: data.id,
      },
      data,
    });

    revalidatePath("/admin/products");

    return { success: true, message: "Product updated successfully." };
  } catch (error) {
    return { success: false, message: "Failed to update product." };
  }
}

// Get product by ID
export async function getProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      return { success: false, message: "Product not found." };
    }

    return convertPrismaObjectToJSObject(product);
  } catch (error) {
    return { success: false, message: "Failed to fetch product." };
  }
}

// Get Call Categories
export async function getAllCategories() {
  try {
    const categories = await prisma.product.groupBy({
      by: ["category"],
      _count: {
        _all: true, // This makes the groupBy valid
      },
      where: {
        category: {
          not: undefined,
        },
      },
      orderBy: {
        category: "asc",
      },
    });

    // Extract both categories and count
    const data = categories.map((item) => ({
      category: item.category,
      count: item._count._all,
    }));
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, message: "Failed to fetch categories." };
  }
}

// Get featured products
export async function getFeaturedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isFeatured: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    return convertPrismaObjectToJSObject(products);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return { success: false, message: "Failed to fetch featured products." };
  }
}
