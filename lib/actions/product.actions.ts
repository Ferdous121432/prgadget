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
import { sanitizeRichTextHtml } from "../html";
import { convertPrismaObjectToJSObject, formatError } from "../utils";
import {
  deleteProductVector,
  upsertProductVector,
  vectorSearchProducts,
} from "./vector-search.actions";

const productCategoryInclude = {
  Brand: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  MainCategory: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  SubCategory: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  SubSubCategory: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.ProductInclude;

type ProductWithCategoryContext = Prisma.ProductGetPayload<{
  include: typeof productCategoryInclude;
}>;

function serializeProductCategoryContext(product: any) {
  const serializedProduct = convertPrismaObjectToJSObject(product) as any;

  return {
    ...serializedProduct,
    brand: serializedProduct.Brand?.name ?? serializedProduct.brand ?? "",
    brandId: serializedProduct.brandId ?? serializedProduct.Brand?.id ?? null,
    mainCategory: serializedProduct.MainCategory?.name ?? "",
    subCategory: serializedProduct.SubCategory?.name ?? null,
    subSubCategory: serializedProduct.SubSubCategory?.name ?? null,
  };
}

function parsePriceRanges(price?: string) {
  if (!price || price === "all") {
    return [] as Array<{ min: number; max: number }>;
  }

  return price
    .split(",")
    .map((range) => range.trim())
    .map((range) => {
      const [min, max] = range.split("-").map(Number);

      if (Number.isNaN(min) || Number.isNaN(max)) {
        return null;
      }

      return { min, max };
    })
    .filter((range): range is { min: number; max: number } => Boolean(range));
}

function buildPriceFilter(price?: string): Prisma.ProductWhereInput {
  const ranges = parsePriceRanges(price);

  if (ranges.length === 0) {
    return {};
  }

  if (ranges.length === 1) {
    return {
      price: {
        gte: ranges[0].min,
        lte: ranges[0].max,
      },
    };
  }

  return {
    OR: ranges.map((range) => ({
      price: {
        gte: range.min,
        lte: range.max,
      },
    })),
  };
}

function buildRatingFilter(rating?: string): Prisma.ProductWhereInput {
  if (!rating || rating === "all") {
    return {};
  }

  return {
    rating: {
      gte: Number(rating),
    },
  };
}

function buildCategoryFilter(category?: string): Prisma.ProductWhereInput {
  if (!category || category === "all") {
    return {};
  }

  return {
    MainCategory: {
      is: {
        name: category,
      },
    },
  };
}

function buildBrandFilter(brand?: string): Prisma.ProductWhereInput {
  if (!brand || brand === "all") {
    return {};
  }

  return {
    brand: {
      equals: brand,
      mode: "insensitive",
    },
  };
}

function buildStockFilter(stock?: string): Prisma.ProductWhereInput {
  if (!stock || stock === "all") {
    return {};
  }

  if (stock === "in-stock") {
    return {
      stock: {
        gt: 0,
      },
    };
  }

  if (stock === "out-of-stock") {
    return {
      stock: {
        lte: 0,
      },
    };
  }

  return {};
}

function escapeSqlLiteral(value: string) {
  return value.replace(/'/g, "''");
}

function getProductOrderBy(
  sort?: string,
): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "name-asc":
      return [{ name: "asc" }, { createdAt: "desc" }];
    case "name-desc":
      return [{ name: "desc" }, { createdAt: "desc" }];
    case "price-asc":
    case "lowest":
      return [{ price: "asc" }, { createdAt: "desc" }];
    case "price-desc":
    case "highest":
      return [{ price: "desc" }, { createdAt: "desc" }];
    case "stock-asc":
      return [{ stock: "asc" }, { createdAt: "desc" }];
    case "stock-desc":
      return [{ stock: "desc" }, { createdAt: "desc" }];
    case "rating-asc":
      return [{ rating: "asc" }, { createdAt: "desc" }];
    case "rating-desc":
    case "rating":
      return [{ rating: "desc" }, { createdAt: "desc" }];
    case "newest":
    default:
      return [{ createdAt: "desc" }];
  }
}

function getProductSqlOrderBy(sort?: string) {
  switch (sort) {
    case "name-asc":
      return 'LOWER(name) ASC, "createdAt" DESC';
    case "name-desc":
      return 'LOWER(name) DESC, "createdAt" DESC';
    case "price-asc":
    case "lowest":
      return 'price ASC, "createdAt" DESC';
    case "price-desc":
    case "highest":
      return 'price DESC, "createdAt" DESC';
    case "stock-asc":
      return 'stock ASC, "createdAt" DESC';
    case "stock-desc":
      return 'stock DESC, "createdAt" DESC';
    case "rating-asc":
      return 'rating ASC, "createdAt" DESC';
    case "rating-desc":
    case "rating":
      return 'rating DESC, "createdAt" DESC';
    case "newest":
    default:
      return '"createdAt" DESC';
  }
}

//Create a new product
export async function createProduct(data: Product) {
  try {
    // Extract category tags and prepare the create data
    const {
      brandId,
      categoryTags,
      mainCategoryId,
      subCategoryId,
      subSubCategoryId,
      ...restData
    } = data as any;

    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      select: {
        id: true,
        name: true,
      },
    });

    if (!brand) {
      return { success: false, message: "Selected brand not found." };
    }

    const createData: any = {
      ...restData,
      description: sanitizeRichTextHtml(restData.description),
      brand: brand.name,
    };

    createData.Brand = { connect: { id: brand.id } };

    // Main category is required for every product.
    createData.MainCategory = { connect: { id: mainCategoryId } };

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
        (id): id is string => typeof id === "string" && id.length > 0,
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

    const productForVector = await prisma.product.findUnique({
      where: { id: product.id },
      include: productCategoryInclude,
    });

    console.log("ProductData 😍😍😍💥", createData);

    revalidatePath("/admin/products");

    // Add to vector database
    if (productForVector) {
      await upsertProductVector(productForVector);
    }

    // Invalidate all product-related caches
    await invalidateProductCaches();

    return { success: true, message: "Product created successfully." };
  } catch (error) {
    console.log("error 💥💥💥💥", error);
    return {
      success: false,
      message: formatError(error),
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
      brandId,
      categoryTags,
      mainCategoryId,
      subCategoryId,
      subSubCategoryId,
      ...restData
    } = data as any;

    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      select: {
        id: true,
        name: true,
      },
    });

    if (!brand) {
      return { success: false, message: "Selected brand not found." };
    }

    const updateData: any = {
      ...restData,
      description: sanitizeRichTextHtml(restData.description),
      brand: brand.name,
    };

    updateData.Brand = { connect: { id: brand.id } };

    // Main category is required for every product.
    updateData.MainCategory = { connect: { id: mainCategoryId } };

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
          (id): id is string => typeof id === "string" && id.length > 0,
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

    const productForVector = await prisma.product.findUnique({
      where: { id: updatedProduct.id },
      include: productCategoryInclude,
    });

    // console.log("ProductData 😍😍😍💥", updateData);

    revalidatePath("/admin/products");

    // Update in vector database
    if (productForVector) {
      await upsertProductVector(productForVector);
    }

    // Invalidate all product-related caches
    await invalidateProductCaches();

    return { success: true, message: "Product updated successfully." };
  } catch (error) {
    console.log("Product Update Error ❌❌❌❌", error);
    return { success: false, message: formatError(error) };
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

    await prisma.product.delete({
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

export async function getAdminBrandSummaries() {
  try {
    const brandedProducts = await prisma.product.findMany({
      where: {
        brand: {
          not: null,
        },
        NOT: {
          brand: "",
        },
      },
      select: {
        id: true,
        brand: true,
        stock: true,
        price: true,
        createdAt: true,
        MainCategory: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ brand: "asc" }, { createdAt: "desc" }],
    });

    const brandMap = new Map<
      string,
      {
        brand: string;
        productCount: number;
        totalStock: number;
        outOfStockCount: number;
        totalPrice: number;
        latestProductAt: Date;
        categories: Map<string, number>;
      }
    >();

    for (const product of brandedProducts) {
      const brandName = product.brand?.trim();

      if (!brandName) {
        continue;
      }

      const existing = brandMap.get(brandName) ?? {
        brand: brandName,
        productCount: 0,
        totalStock: 0,
        outOfStockCount: 0,
        totalPrice: 0,
        latestProductAt: product.createdAt,
        categories: new Map<string, number>(),
      };

      existing.productCount += 1;
      existing.totalStock += product.stock;
      existing.outOfStockCount += product.stock <= 0 ? 1 : 0;
      existing.totalPrice += Number(product.price);

      if (product.createdAt > existing.latestProductAt) {
        existing.latestProductAt = product.createdAt;
      }

      const categoryName = product.MainCategory?.name ?? "Uncategorized";
      existing.categories.set(
        categoryName,
        (existing.categories.get(categoryName) ?? 0) + 1,
      );

      brandMap.set(brandName, existing);
    }

    const brands = Array.from(brandMap.values())
      .map((brand) => ({
        brand: brand.brand,
        productCount: brand.productCount,
        totalStock: brand.totalStock,
        outOfStockCount: brand.outOfStockCount,
        averagePrice:
          brand.productCount > 0 ? brand.totalPrice / brand.productCount : 0,
        latestProductAt: brand.latestProductAt,
        categoryNames: Array.from(brand.categories.entries())
          .sort((left, right) => right[1] - left[1])
          .slice(0, 3)
          .map(([name]) => name),
      }))
      .sort((left, right) => {
        if (right.productCount !== left.productCount) {
          return right.productCount - left.productCount;
        }

        return left.brand.localeCompare(right.brand);
      });

    return {
      success: true,
      data: brands,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to retrieve brand summaries",
      data: [],
    };
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
        include: productCategoryInclude,
      });

      return data ? serializeProductCategoryContext(data) : null;
    },
    CACHE_CONFIG.PRODUCT_BY_SLUG.ttl,
  );
}

// Get all products with Redis cache
export async function getAllProducts({
  query,
  limit = DB_ADMIN_PRODUCT_TAKE,
  page,
  category,
  brand,
  stock,
  price,
  rating,
  sort,
  useVectorSearch = false,
}: {
  query: string;
  limit?: number;
  page: number;
  category?: string;
  brand?: string;
  stock?: string;
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
      brand: brand !== "all" ? brand : undefined,
      stock: stock !== "all" ? stock : undefined,
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
    brand,
    stock,
    price,
    rating,
    sort,
  });

  return getCachedData(
    cacheKey,
    async () => {
      const whereClause: Prisma.ProductWhereInput = {
        ...buildCategoryFilter(category),
        ...buildBrandFilter(brand),
        ...buildStockFilter(stock),
        ...buildPriceFilter(price),
        ...buildRatingFilter(rating),
      };

      // If no query, use simple filtering
      if (!query || query === "all") {
        const data = await prisma.product.findMany({
          where: whereClause,
          orderBy: getProductOrderBy(sort),
          skip: (page - 1) * limit,
          take: limit,
        });

        const dataCount = await prisma.product.count({
          where: whereClause,
        });

        return {
          data,
          totalPages: Math.ceil(dataCount / limit),
        };
      }

      // For search queries, use raw SQL with relevance scoring
      const searchTerms = query.split(" ").filter((term) => term.length > 0);
      const selectedCategory =
        category && category !== "all"
          ? await prisma.mainCategory.findFirst({
              where: { name: category },
              select: { id: true },
            })
          : null;

      const categoryCondition = selectedCategory
        ? `AND "mainCategoryId" = '${escapeSqlLiteral(selectedCategory.id)}'`
        : category && category !== "all"
          ? "AND 1 = 0"
          : "";

      const brandCondition =
        brand && brand !== "all"
          ? `AND LOWER(brand) = LOWER('${escapeSqlLiteral(brand)}')`
          : "";

      const stockCondition =
        stock === "in-stock"
          ? "AND stock > 0"
          : stock === "out-of-stock"
            ? "AND stock <= 0"
            : "";

      // Price filter
      let priceCondition = "";
      const ranges = parsePriceRanges(price);
      if (ranges.length > 0) {
        if (ranges.length > 1) {
          const conditions = ranges
            .map((range) => {
              return `(price BETWEEN ${range.min} AND ${range.max})`;
            })
            .filter(Boolean);
          if (conditions.length > 0) {
            priceCondition = `AND (${conditions.join(" OR ")})`;
          }
        } else {
          priceCondition = `AND price BETWEEN ${ranges[0].min} AND ${ranges[0].max}`;
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
        `,
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
      `,
        )
        .join("")}
    )
    ${categoryCondition}
    ${brandCondition}
    ${stockCondition}
    ${priceCondition}
    ${ratingCondition}
    ORDER BY 
      relevance_score DESC,
      ${getProductSqlOrderBy(sort)}
    LIMIT $${searchTerms.length + 2}
    OFFSET $${searchTerms.length + 3}
  `;

      const data = await prisma.$queryRawUnsafe(
        relevanceQuery,
        query,
        ...searchTerms,
        limit,
        (page - 1) * limit,
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
      `,
        )
        .join("")}
    )
    ${categoryCondition}
    ${brandCondition}
    ${stockCondition}
    ${priceCondition}
    ${ratingCondition}
  `;

      const countResult = (await prisma.$queryRawUnsafe(
        countQuery,
        query,
        ...searchTerms,
      )) as Array<{ total: bigint }>;

      const dataCount = Number(countResult[0]?.total || 0);

      return {
        data: convertPrismaObjectToJSObject(data),
        totalPages: Math.ceil(dataCount / limit),
      };
    },
    CACHE_CONFIG.ALL_PRODUCTS.ttl,
  );
}

export async function getProductBrands() {
  const cacheKey = "product-search-brands";

  return getCachedData(
    cacheKey,
    async () => {
      const brands = await prisma.brand.findMany({
        select: {
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      return brands
        .map((brand) => brand.name)
        .filter((brand): brand is string => Boolean(brand));
    },
    CACHE_CONFIG.ALL_PRODUCTS.ttl,
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
    CACHE_CONFIG.PRODUCT_BY_ID.ttl,
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
    CACHE_CONFIG.FEATURED_PRODUCTS.ttl,
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
    CACHE_CONFIG.LATEST_PRODUCTS.ttl,
  );
}

// Get related products by IDs
export async function getRelatedProducts(
  productId: string,
  mainCategoryId?: string | null,
  subCategoryId?: string | null,
  subSubCategoryId?: string | null,
  brand?: string | null,
) {
  try {
    const matchClauses: Prisma.ProductWhereInput[] = [];

    if (subSubCategoryId) {
      matchClauses.push({ subSubCategoryId });
    }

    if (subCategoryId) {
      matchClauses.push({ subCategoryId });
    }

    if (mainCategoryId) {
      matchClauses.push({ mainCategoryId });
    }

    if (brand) {
      matchClauses.push({ brand });
    }

    const rows = await prisma.product.findMany({
      where: {
        id: { not: productId },
        ...(matchClauses.length > 0 ? { OR: matchClauses } : {}),
      },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      take: matchClauses.length > 0 ? 24 : 5,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: true,
        rating: true,
        brand: true,
        createdAt: true,
        mainCategoryId: true,
        subCategoryId: true,
        subSubCategoryId: true,
      },
    });

    const items = rows
      .map((product) => {
        let score = 0;

        if (subSubCategoryId && product.subSubCategoryId === subSubCategoryId) {
          score += 8;
        }

        if (subCategoryId && product.subCategoryId === subCategoryId) {
          score += 4;
        }

        if (mainCategoryId && product.mainCategoryId === mainCategoryId) {
          score += 2;
        }

        if (brand && product.brand === brand) {
          score += 1;
        }

        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: Array.isArray(product.images)
            ? product.images[0]
            : (product.images as any) || "",
          rating: product.rating ?? 0,
          score,
          createdAt: product.createdAt,
        };
      })
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }

        const ratingDiff = Number(right.rating ?? 0) - Number(left.rating ?? 0);
        if (ratingDiff !== 0) {
          return ratingDiff;
        }

        return (
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime()
        );
      })
      .slice(0, 5)
      .map(({ createdAt, score, ...product }) => product);

    return items;
  } catch (error) {
    console.error(error);
  }
}
