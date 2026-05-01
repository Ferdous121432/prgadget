"use server";

import { prisma } from "@/db/prisma";
import { getCachedData } from "@/lib/cache/redis";
import { stripHtml } from "@/lib/html";
import { vectorIndex } from "@/lib/vector/config";
import { ProductSchemaPublic, ProductWithIds } from "@/types";
import { InferenceClient } from "@huggingface/inference";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY!,
// });

const hf = new InferenceClient(process.env.HUGGINGFACE_API_KEY);
const VECTOR_TLS_ERROR_CODES = new Set([
  "DEPTH_ZERO_SELF_SIGNED_CERT",
  "SELF_SIGNED_CERT_IN_CHAIN",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
]);
const loggedVectorWarnings = new Set<string>();

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function getErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : undefined;
}

function isVectorTlsError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  const code = getErrorCode(error);

  if (code && VECTOR_TLS_ERROR_CODES.has(code)) {
    return true;
  }

  if (message.includes("self-signed certificate")) {
    return true;
  }

  if (error && typeof error === "object" && "cause" in error) {
    return isVectorTlsError((error as { cause?: unknown }).cause);
  }

  return false;
}

function logVectorFailure(context: string, error: unknown) {
  if (isVectorTlsError(error)) {
    const warningKey = `${context}:tls`;

    if (!loggedVectorWarnings.has(warningKey)) {
      loggedVectorWarnings.add(warningKey);
      console.warn(
        `${context} unavailable because the Upstash Vector TLS certificate could not be verified. Falling back without vector results.`,
      );
    }

    return;
  }

  console.error(`${context}:`, error);
}

function getCategoryName(
  product: Record<string, any>,
  field: "mainCategory" | "subCategory" | "subSubCategory",
  relationField: "MainCategory" | "SubCategory" | "SubSubCategory",
) {
  const directValue = product[field];

  if (typeof directValue === "string" && directValue.trim()) {
    return directValue;
  }

  const relationValue = product[relationField]?.name;
  return typeof relationValue === "string" ? relationValue : null;
}

function normalizeVectorProduct(product: Record<string, any>) {
  const relationBrandName = product.Brand?.name;

  return {
    ...product,
    brand:
      typeof product.brand === "string" && product.brand.trim()
        ? product.brand
        : typeof relationBrandName === "string"
          ? relationBrandName
          : null,
    mainCategory: getCategoryName(product, "mainCategory", "MainCategory"),
    subCategory: getCategoryName(product, "subCategory", "SubCategory"),
    subSubCategory: getCategoryName(
      product,
      "subSubCategory",
      "SubSubCategory",
    ),
  } as Record<string, any> & {
    mainCategory: string | null;
    subCategory: string | null;
    subSubCategory: string | null;
  };
}

// Generate embedding for text
// Free embedding generation with Hugging Face
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // console.log("🔄 Generating Hugging Face embedding...");

    // Use free sentence-transformers model
    const response = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: text,
    });

    // Handle different response formats
    let embedding: number[];
    if (Array.isArray(response) && Array.isArray(response[0])) {
      embedding = response[0] as number[];
    } else {
      embedding = response as number[];
    }

    console.log("✅ Generated Hugging Face embedding successfully");
    return embedding;
  } catch (error) {
    console.error("Hugging Face embedding error: 💥💥💥", error);

    // Fallback to simple text-based embedding
    return generateSimpleEmbedding(text);
  }
}

// Upsert product to vector database
export async function upsertProductVector(
  product: ProductSchemaPublic | Record<string, any>,
) {
  try {
    const normalizedProduct = normalizeVectorProduct(product);

    // Create searchable text from product data
    const searchText = [
      normalizedProduct.name,
      stripHtml(normalizedProduct.description),
      normalizedProduct.mainCategory,
      normalizedProduct.subCategory,
      normalizedProduct.subSubCategory,
      normalizedProduct.brand,
      // Add more searchable fields
    ]
      .filter(Boolean)
      .join(" ");

    // Generate embedding
    const embedding = await generateEmbedding(searchText);

    // Upsert to vector database
    await vectorIndex.upsert([
      {
        id: normalizedProduct.id,
        vector: embedding,
        metadata: {
          id: normalizedProduct.id,
          name: normalizedProduct.name,
          description: normalizedProduct.description,
          price: normalizedProduct.price,
          mainCategory: normalizedProduct.mainCategory,
          subCategory: normalizedProduct.subCategory,
          subSubCategory: normalizedProduct.subSubCategory,
          brand: normalizedProduct.brand,
          stock: normalizedProduct.stock,
          rating: normalizedProduct.rating,
          images: normalizedProduct.images,
          slug: normalizedProduct.slug,
          isFeatured: normalizedProduct.isFeatured,
          updatedAt: new Date(normalizedProduct.updatedAt).toISOString(),
        },
      },
    ]);

    console.log(`Product ${normalizedProduct.id} added to vector database`);
    return { success: true };
  } catch (error) {
    console.error("Error upserting product vector:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Fallback embedding using simple text analysis (completely free)
function generateSimpleEmbedding(text: string): number[] {
  console.log("🔄 Using simple text-based embedding fallback");

  const words = text.toLowerCase().split(/\s+/);
  const features = new Array(384).fill(0); // Match MiniLM dimensions

  // Create features based on text characteristics
  words.forEach((word, index) => {
    // Hash each word to a feature index
    const hash = word.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    const featureIndex = Math.abs(hash) % features.length;
    features[featureIndex] += 1 / (index + 1); // Weight by position

    // Add character-based features
    features[(hash + word.length) % features.length] +=
      word.length / text.length;
  });

  // Add text-level features
  features[0] = text.length / 1000; // Text length feature
  features[1] = words.length / 100; // Word count feature

  // Normalize the vector
  const magnitude = Math.sqrt(
    features.reduce((sum, val) => sum + val * val, 0),
  );
  return features.map((val) => (magnitude > 0 ? val / magnitude : 0));
}

// Sync products to vector database
export async function syncAllProductsToVector() {
  try {
    console.log("📊 Fetching all products from database...");
    const products = await prisma.product.findMany({
      include: {
        Brand: {
          select: { name: true },
        },
        MainCategory: {
          select: { name: true },
        },
        SubCategory: {
          select: { name: true },
        },
        SubSubCategory: {
          select: { name: true },
        },
      },
    });

    console.log(
      `🔄 Syncing ${products.length} products to vector database using free embeddings...`,
    );

    const batchSize = 5; // Smaller batches for free tier
    let synced = 0;

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);

      const batchPromises = batch.map(async (product: any) => {
        try {
          const normalizedProduct = normalizeVectorProduct(product);

          // Create searchable text
          const searchText = [
            normalizedProduct.name,
            stripHtml(normalizedProduct.description),
            normalizedProduct.mainCategory,
            normalizedProduct.subCategory,
            normalizedProduct.subSubCategory,
            normalizedProduct.brand,
          ]
            .filter(Boolean)
            .join(" ");

          // Generate free embedding
          const embedding = await generateEmbedding(searchText);

          // Upsert to vector database
          await vectorIndex.upsert([
            {
              id: normalizedProduct.id,
              vector: embedding,
              metadata: {
                id: normalizedProduct.id,
                name: normalizedProduct.name,
                description: normalizedProduct.description,
                price: normalizedProduct.price,
                mainCategory: normalizedProduct.mainCategory,
                subCategory: normalizedProduct.subCategory,
                subSubCategory: normalizedProduct.subSubCategory,
                brand: normalizedProduct.brand,
                stock: normalizedProduct.stock,
                rating: normalizedProduct.rating,
                images: normalizedProduct.images,
                slug: normalizedProduct.slug,
                isFeatured: normalizedProduct.isFeatured,
                updatedAt: new Date(normalizedProduct.updatedAt).toISOString(),
              },
            },
          ]);

          synced++;
          return { success: true, id: normalizedProduct.id };
        } catch (error) {
          console.error(`❌ Failed to sync product ${product.id}:`, error);
          return { success: false, id: product.id, error };
        }
      });

      await Promise.all(batchPromises);

      // Add delay to respect free tier rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(
        `✅ Synced batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)}`,
      );
    }

    console.log(
      `🎉 Successfully synced ${synced}/${products.length} products using free embeddings`,
    );

    return { success: true, synced };
  } catch (error) {
    console.error("💥 Batch sync error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Get similar products (for recommendations)
export async function getSimilarProducts(productId: string, limit = 8) {
  const cacheKey = `similar-products-${productId}-${limit}`;

  return getCachedData(
    cacheKey,
    async () => {
      try {
        // Get the product's vector
        const productVector = (await vectorIndex.fetch([productId])) as any;

        if (
          !productVector ||
          productVector.length === 0 ||
          !productVector[0]?.vector
        ) {
          return { data: [] };
        }

        // Search for similar products
        const results = await vectorIndex.query({
          vector: productVector[0].vector,
          topK: limit + 1, // +1 to exclude the product itself
          includeMetadata: true,
        });

        // Filter out the original product
        const similarProducts = results
          .filter((result) => result.id !== productId)
          .slice(0, limit)
          .map((result) => result.metadata as ProductWithIds);

        return { data: similarProducts };
      } catch (error) {
        logVectorFailure("Similar products", error);
        return { data: [] };
      }
    },
    1800, // 30 minutes cache
  );
}

// Delete product from vector database
export async function deleteProductVector(productId: string) {
  try {
    await vectorIndex.delete([productId]);
    console.log(`Product ${productId} removed from vector database`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting product vector:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// lib/actions/vector-search.actions.ts
export async function vectorSearchProducts({
  query,
  page = 1,
  limit = 20,
  category,
  brand,
  stock,
  minPrice,
  maxPrice,
  minRating,
  sort = "newest",
}: {
  query: string;
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  stock?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: string;
}) {
  const cacheKey = `vector-search-${query}-${page}-${category}-${brand}-${stock}-${minPrice}-${maxPrice}-${minRating}-${sort}`;

  return getCachedData(
    cacheKey,
    async () => {
      try {
        console.log("🔍 Vector searching for:", {
          query,
          category,
          brand,
          stock,
          page,
        });

        // Generate query embedding
        const queryEmbedding = await generateEmbedding(query);

        // Search vector database
        const searchResults = await vectorIndex.query({
          vector: queryEmbedding,
          topK: limit * 3,
          includeMetadata: true,
        });

        console.log(`📊 Found ${searchResults.length} vector results`);

        // Apply your existing filtering and sorting logic...
        let filteredResults = searchResults.filter((result) => {
          const metadata = result.metadata as any;
          const itemPrice = Number(metadata.price ?? 0);
          const itemRating = Number(metadata.rating ?? 0);
          const itemStock = Number(metadata.stock ?? 0);

          if (
            category &&
            category !== "all" &&
            metadata.mainCategory !== category
          ) {
            return false;
          }

          if (
            brand &&
            brand !== "all" &&
            String(metadata.brand ?? "").toLowerCase() !== brand.toLowerCase()
          ) {
            return false;
          }

          if (stock === "in-stock" && itemStock <= 0) {
            return false;
          }

          if (stock === "out-of-stock" && itemStock > 0) {
            return false;
          }

          if (minPrice && itemPrice < minPrice) {
            return false;
          }

          if (maxPrice && itemPrice > maxPrice) {
            return false;
          }

          if (minRating && itemRating < minRating) {
            return false;
          }

          // Lower threshold for simple embeddings
          if (result.score < 0.3) {
            return false;
          }

          return true;
        });

        // Sort results
        filteredResults.sort((a, b) => {
          const aData = a.metadata as any;
          const bData = b.metadata as any;
          const aName = String(aData.name ?? "").toLowerCase();
          const bName = String(bData.name ?? "").toLowerCase();
          const aPrice = Number(aData.price ?? 0);
          const bPrice = Number(bData.price ?? 0);
          const aRating = Number(aData.rating ?? 0);
          const bRating = Number(bData.rating ?? 0);
          const aStock = Number(aData.stock ?? 0);
          const bStock = Number(bData.stock ?? 0);

          switch (sort) {
            case "name-asc":
              return aName.localeCompare(bName);
            case "name-desc":
              return bName.localeCompare(aName);
            case "price-asc":
            case "lowest":
              return aPrice - bPrice;
            case "price-desc":
            case "highest":
              return bPrice - aPrice;
            case "stock-asc":
              return aStock - bStock;
            case "stock-desc":
              return bStock - aStock;
            case "rating-asc":
              return aRating - bRating;
            case "rating-desc":
            case "rating":
              return bRating - aRating;
            case "newest":
            default:
              return (
                new Date(bData.updatedAt).getTime() -
                new Date(aData.updatedAt).getTime()
              );
          }
        });

        // Pagination
        const startIndex = (page - 1) * limit;
        const paginatedResults = filteredResults.slice(
          startIndex,
          startIndex + limit,
        );

        return {
          data: paginatedResults.map((result) => ({
            ...result.metadata,
            vectorScore: result.score,
          })) as any[],
          totalResults: filteredResults.length,
          totalPages: Math.ceil(filteredResults.length / limit),
          isVectorSearch: true,
        };
      } catch (error: any) {
        logVectorFailure("Vector search failed", error);

        // Fallback to regular database search
        return await fallbackSearch({
          query,
          page,
          limit,
          category,
          brand,
          stock,
          minPrice,
          maxPrice,
          minRating,
          sort,
        });
      }
    },
    300, // 5 minutes cache
  );
}

// Fallback search function
async function fallbackSearch({
  query,
  page,
  limit,
  category,
  brand,
  stock,
  minPrice,
  maxPrice,
  minRating,
  sort,
}: {
  query: string;
  page: number;
  limit: number;
  category?: string;
  brand?: string;
  stock?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort: string;
}) {
  const whereClause: any = {};

  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  if (category) {
    whereClause.MainCategory = {
      is: {
        name: category,
      },
    };
  }

  if (brand) {
    whereClause.brand = {
      equals: brand,
      mode: "insensitive",
    };
  }

  if (stock === "in-stock") {
    whereClause.stock = { gt: 0 };
  } else if (stock === "out-of-stock") {
    whereClause.stock = { lte: 0 };
  }

  if (minPrice || maxPrice) {
    whereClause.price = {};
    if (minPrice) whereClause.price.gte = minPrice;
    if (maxPrice) whereClause.price.lte = maxPrice;
  }

  if (minRating) {
    whereClause.rating = { gte: minRating };
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "name-asc") {
    orderBy = { name: "asc" };
  } else if (sort === "name-desc") {
    orderBy = { name: "desc" };
  } else if (sort === "price-asc" || sort === "lowest") {
    orderBy = { price: "asc" };
  } else if (sort === "price-desc" || sort === "highest") {
    orderBy = { price: "desc" };
  } else if (sort === "stock-asc") {
    orderBy = { stock: "asc" };
  } else if (sort === "stock-desc") {
    orderBy = { stock: "desc" };
  } else if (sort === "rating-asc") {
    orderBy = { rating: "asc" };
  } else if (sort === "rating-desc" || sort === "rating") {
    orderBy = { rating: "desc" };
  }

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where: whereClause }),
  ]);

  return {
    data: products,
    totalResults: totalCount,
    totalPages: Math.ceil(totalCount / limit),
    isFallback: true,
  };
}
