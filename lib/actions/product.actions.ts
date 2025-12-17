"use server";

import { prisma } from "@/db/prisma";
import { DB_ADMIN_PRODUCT_TAKE, LATEST_PRODUCTS_LIMIT } from "../constants";
// import { PrismaClient } from "../generated/prisma";

import { utapi } from "@/app/api/uploadthing/uploadthing";
import { Product, ProductWithId } from "@/types";
import { revalidatePath } from "next/cache";
import {
  CACHE_CONFIG,
  generateCacheKey,
  getCachedData,
  invalidateProductCaches,
} from "../cache/redis";
import { Prisma } from "../generated/prisma";
import { convertPrismaObjectToJSObject } from "../utils";
import {
  deleteProductVector,
  upsertProductVector,
  vectorSearchProducts,
} from "./vector-search.actions";

//Create a new product
export async function createProduct(data: Product) {
  try {
    // Extract category tags and prepare the create data
    const {
      categoryTags,
      mainCategoryId,
      subCategoryId,
      subSubCategoryId,
      ...restData
    } = data as any;

    const createData: any = {
      ...restData,
    };

    // Handle category relations
    if (mainCategoryId) {
      createData.MainCategory = { connect: { id: mainCategoryId } };
    }

    if (subCategoryId) {
      createData.SubCategory = { connect: { id: subCategoryId } };
    }

    if (subSubCategoryId) {
      createData.SubSubCategory = { connect: { id: subSubCategoryId } };
    }

    // Handle category tags relation (many-to-many via junction table)
    if (Array.isArray(categoryTags) && categoryTags.length > 0) {
      // categoryTags is now an array of IDs directly
      const validTagIds = categoryTags.filter(
        (id): id is string => typeof id === "string" && id.length > 0
      );
      if (validTagIds.length > 0) {
        createData.categoryTags = {
          create: validTagIds.map((categoryTagId) => ({
            categoryTagId,
          })),
        };
      }
    }

    const product = await prisma.product.create({
      data: createData,
    });

    console.log("ProductData 😍😍😍💥", createData);

    revalidatePath("/admin/products");

    // Add to vector database
    await upsertProductVector(product as any);

    // Invalidate all product-related caches
    await invalidateProductCaches();

    return { success: true, message: "Product created successfully." };
  } catch (error) {
    console.log("error 💥💥💥💥", error);
    return {
      success: false,
      message: "Failed to create product.",
    };
  }
}

// Update product by ID
export async function updateProduct(data: ProductWithId) {
  try {
    const productExists = await prisma.product.findUnique({
      where: { id: data.id },
    });
    if (!productExists) {
      return { success: false, message: "Product not found." };
    }

    // Extract category tags and prepare the update data
    const {
      categoryTags,
      mainCategoryId,
      subCategoryId,
      subSubCategoryId,
      ...restData
    } = data as any;

    const updateData: any = {
      ...restData,
    };

    // Handle category relations
    if (mainCategoryId) {
      updateData.MainCategory = { connect: { id: mainCategoryId } };
    } else if (mainCategoryId === null) {
      updateData.MainCategory = { disconnect: true };
    }

    if (subCategoryId) {
      updateData.SubCategory = { connect: { id: subCategoryId } };
    } else if (subCategoryId === null) {
      updateData.SubCategory = { disconnect: true };
    }

    if (subSubCategoryId) {
      updateData.SubSubCategory = { connect: { id: subSubCategoryId } };
    } else if (subSubCategoryId === null) {
      updateData.SubSubCategory = { disconnect: true };
    }

    // Handle category tags relation (many-to-many via junction table)
    if (Array.isArray(categoryTags)) {
      // First, delete existing category tag relations
      await prisma.productCategoryTag.deleteMany({
        where: { productId: data.id },
      });

      // Then create new relations if there are tags
      if (categoryTags.length > 0) {
        // categoryTags is now an array of IDs directly
        const validTagIds = categoryTags.filter(
          (id): id is string => typeof id === "string" && id.length > 0
        );
        if (validTagIds.length > 0) {
          updateData.categoryTags = {
            create: validTagIds.map((categoryTagId) => ({
              categoryTagId,
            })),
          };
        }
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: data.id },
      data: updateData,
    });

    // console.log("ProductData 😍😍😍💥", updateData);

    revalidatePath("/admin/products");

    // Update in vector database
    await upsertProductVector(updatedProduct as any);

    // Invalidate all product-related caches
    await invalidateProductCaches();

    return { success: true, message: "Product updated successfully." };
  } catch (error) {
    console.log("Product Update Error ❌❌❌❌", error);
    return { success: false, message: "Failed to update product." };
  }
}

// Delete product by ID
export async function deleteProduct(id: string) {
  try {
    const productExists = await prisma.product.findUnique({
      where: { id },
    });
    if (!productExists) {
      return { success: false, message: "Product not found." };
    }

    // Delete associated images from UploadThing
    if (productExists.image_keys && Array.isArray(productExists.image_keys)) {
      await utapi.deleteFiles(productExists.image_keys);
    }

    const data = await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/admin/products");

    // Remove from vector database
    await deleteProductVector(id);

    // Invalidate all product-related caches
    await invalidateProductCaches();

    return { success: true, message: "Product deleted successfully." };
  } catch (error) {
    return { success: false, message: "Failed to delete product." };
  }
}

//Get single product by slug with Redis cache
export async function getProductBySlug(slug: string) {
  const cacheKey = generateCacheKey(CACHE_CONFIG.PRODUCT_BY_SLUG.key, { slug });

  return getCachedData(
    cacheKey,
    async () => {
      const data = await prisma.product.findFirst({
        where: { slug },
      });

      return convertPrismaObjectToJSObject(data);
    },
    CACHE_CONFIG.PRODUCT_BY_SLUG.ttl
  );
}

// Get all products with Redis cache
export async function getAllProducts({
  query,
  limit = DB_ADMIN_PRODUCT_TAKE,
  page,
  category,
  price,
  rating,
  sort,
  useVectorSearch = false,
}: {
  query: string;
  limit?: number;
  page: number;
  category?: string;
  price?: string;
  rating?: string;
  sort?: string;
  useVectorSearch?: boolean;
}) {
  // If query exists and vector search is enabled, use vector search
  if (query && query !== "all" && query.trim() !== "" && useVectorSearch) {
    // Parse price range
    let minPrice, maxPrice;
    if (price && price !== "all") {
      const [min, max] = price.split("-").map(Number);
      minPrice = min;
      maxPrice = max;
    }

    // Parse rating
    let minRating: number | undefined;
    if (rating && rating !== "all") {
      minRating = Number(rating);
    }

    return await vectorSearchProducts({
      query,
      page,
      category: category !== "all" ? category : undefined,
      minPrice,
      maxPrice,
      minRating,
      sort,
      limit: LATEST_PRODUCTS_LIMIT,
    });
  }

  const cacheKey = generateCacheKey(CACHE_CONFIG.ALL_PRODUCTS.key, {
    query,
    limit,
    page,
    category,
    price,
    rating,
    sort,
  });

  return getCachedData(
    cacheKey,
    async () => {
      // If no query, use simple filtering
      if (!query || query === "all") {
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
      // const categoryCondition =
      //   category && category !== "all" ? `AND category = '${category}'` : "";

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
    },
    CACHE_CONFIG.ALL_PRODUCTS.ttl
  );
}

// Get product by ID with Redis cache
export async function getProductById(id: string) {
  const cacheKey = generateCacheKey(CACHE_CONFIG.PRODUCT_BY_ID.key, { id });

  return getCachedData(
    cacheKey,
    async () => {
      try {
        const product = await prisma.product.findUnique({
          where: { id },
        });

        if (!product) {
          return { success: false, message: "Product not found." };
        }

        return convertPrismaObjectToJSObject(product);
      } catch (error) {
        return { success: false, message: "Failed to fetch product." };
      }
    },
    CACHE_CONFIG.PRODUCT_BY_ID.ttl
  );
}

// Get product by ID without cache (for admin updates)
export async function getProductByIdNoCache(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        categoryTags: {
          include: {
            categoryTag: true,
          },
        },
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

// Get featured products with Redis cache
export async function getFeaturedProducts() {
  return getCachedData(
    CACHE_CONFIG.FEATURED_PRODUCTS.key,
    async () => {
      try {
        const products = await prisma.product.findMany({
          where: { isFeatured: true },
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            stock: true,
          },
          orderBy: { createdAt: "desc" },
          take: LATEST_PRODUCTS_LIMIT,
        });

        return convertPrismaObjectToJSObject(products);
      } catch (error) {
        console.error("Error fetching featured products:", error);
        return {
          success: false,
          message: "Failed to fetch featured products.",
        };
      }
    },
    CACHE_CONFIG.FEATURED_PRODUCTS.ttl
  );
}

// Get latest products with Redis cache
export async function getLatestProducts() {
  return getCachedData(
    CACHE_CONFIG.LATEST_PRODUCTS.key,
    async () => {
      try {
        const products = await prisma.product.findMany({
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            stock: true,
          },
          take: LATEST_PRODUCTS_LIMIT,
        });
        return convertPrismaObjectToJSObject(products);
      } catch (error) {
        console.error("Error fetching latest products:", error);
        return { success: false, message: "Failed to fetch latest products." };
      }
    },
    CACHE_CONFIG.LATEST_PRODUCTS.ttl
  );
}

// Get related products by IDs
export async function getRelatedProducts(
  productId: string,
  mainCategory?: string,
  subCategory?: string,
  brand?: string
) {
  try {
    const items = (await prisma.product
      .findMany({
        where: {
          id: { not: productId },
          ...(brand ? { brand } : {}),
        },
        orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: true,
          rating: true,
        },
      })
      .then((rows) =>
        rows.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          image: Array.isArray(p.images)
            ? p.images[0]
            : (p.images as any) || "",
          rating: p.rating ?? 0,
        }))
      )) as any[];
    return items;
  } catch (error) {
    console.error(error);
  }
}
