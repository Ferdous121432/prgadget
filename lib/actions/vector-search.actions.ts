"use server";

import { prisma } from "@/db/prisma";
import { getCachedData } from "@/lib/cache/redis";
import { vectorIndex } from "@/lib/vector/config";
import { ProductSchemaPublic, ProductWithIds } from "@/types";
import { InferenceClient } from "@huggingface/inference";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY!,
// });

const hf = new InferenceClient(process.env.HUGGINGFACE_API_KEY);

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
export async function upsertProductVector(product: ProductSchemaPublic) {
  try {
    // Create searchable text from product data
    const searchText = [
      product.name,
      product.description,
      product.mainCategory,
      product.subCategory,
      product.subSubCategory,
      product.brand,
      // Add more searchable fields
    ]
      .filter(Boolean)
      .join(" ");

    // Generate embedding
    const embedding = await generateEmbedding(searchText);

    // Upsert to vector database
    await vectorIndex.upsert([
      {
        id: product.id,
        vector: embedding,
        metadata: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          mainCategory: product.mainCategory,
          subCategory: product.subCategory,
          subSubCategory: product.subSubCategory,
          brand: product.brand,
          stock: product.stock,
          rating: product.rating,
          images: product.images,
          slug: product.slug,
          isFeatured: product.isFeatured,
          updatedAt: product.updatedAt.toISOString(),
        },
      },
    ]);

    console.log(`Product ${product.id} added to vector database`);
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
    features.reduce((sum, val) => sum + val * val, 0)
  );
  return features.map((val) => (magnitude > 0 ? val / magnitude : 0));
}

// Sync products to vector database
export async function syncAllProductsToVector() {
  try {
    console.log("📊 Fetching all products from database...");
    const products = await prisma.product.findMany();

    console.log(
      `🔄 Syncing ${products.length} products to vector database using free embeddings...`
    );

    const batchSize = 5; // Smaller batches for free tier
    let synced = 0;

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);

      const batchPromises = batch.map(async (product: any) => {
        try {
          // Create searchable text
          const searchText = [
            product.name,
            product.description,
            product.mainCategory,
            product.subCategory,
            product.subSubCategory,
            product.brand,
          ]
            .filter(Boolean)
            .join(" ");

          // Generate free embedding
          const embedding = await generateEmbedding(searchText);

          // Upsert to vector database
          await vectorIndex.upsert([
            {
              id: product.id,
              vector: embedding,
              metadata: {
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                mainCategory: product.mainCategory,
                subCategory: product.subCategory,
                subSubCategory: product.subSubCategory,
                brand: product.brand,
                stock: product.stock,
                rating: product.rating,
                images: product.images,
                slug: product.slug,
                isFeatured: product.isFeatured,
                updatedAt: product.updatedAt,
              },
            },
          ]);

          synced++;
          return { success: true, id: product.id };
        } catch (error) {
          console.error(`❌ Failed to sync product ${product.id}:`, error);
          return { success: false, id: product.id, error };
        }
      });

      await Promise.all(batchPromises);

      // Add delay to respect free tier rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(
        `✅ Synced batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)}`
      );
    }

    console.log(
      `🎉 Successfully synced ${synced}/${products.length} products using free embeddings`
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
        console.error("Similar products error:", error);
        return { data: [] };
      }
    },
    1800 // 30 minutes cache
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
  minPrice,
  maxPrice,
  minRating,
  sort = "newest",
}: {
  query: string;
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: string;
}) {
  const cacheKey = `vector-search-${query}-${page}-${category}-${minPrice}-${maxPrice}-${minRating}-${sort}`;

  return getCachedData(
    cacheKey,
    async () => {
      try {
        console.log("🔍 Vector searching for:", { query, category, page });

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

          if (
            category &&
            category !== "all" &&
            metadata.mainCategory !== category
          ) {
            return false;
          }

          if (minPrice && metadata.price < minPrice) {
            return false;
          }

          if (maxPrice && metadata.price > maxPrice) {
            return false;
          }

          if (minRating && metadata.rating < minRating) {
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

          switch (sort) {
            case "lowest":
              return aData.price - bData.price;
            case "highest":
              return bData.price - aData.price;
            case "rating":
              return bData.rating - aData.rating;
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
          startIndex + limit
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
        console.error("❌ Vector search failed:", error.message);

        // Fallback to regular database search
        return await fallbackSearch({
          query,
          page,
          limit,
          category,
          minPrice,
          maxPrice,
          minRating,
          sort,
        });
      }
    },
    300 // 5 minutes cache
  );
}

// Fallback search function
async function fallbackSearch({
  query,
  page,
  limit,
  category,
  minPrice,
  maxPrice,
  minRating,
  sort,
}: {
  query: string;
  page: number;
  limit: number;
  category?: string;
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
    whereClause.mainCategory = category;
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
  if (sort === "lowest") {
    orderBy = { price: "asc" };
  } else if (sort === "highest") {
    orderBy = { price: "desc" };
  } else if (sort === "rating") {
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
