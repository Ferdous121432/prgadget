import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache configuration
export const CACHE_CONFIG = {
  // Product caches
  FEATURED_PRODUCTS: { key: "featured-products", ttl: 36000 }, // 10 hours
  LATEST_PRODUCTS: { key: "latest-products", ttl: 36000 }, // 10 hours
  PRODUCT_BY_SLUG: { key: "product", ttl: 36000 }, // 10 hours
  PRODUCT_BY_ID: { key: "product-id", ttl: 36000 }, // 10 hours
  ALL_PRODUCTS: { key: "products-search", ttl: 36000 }, // 10 hours

  // Category caches
  MAIN_CATEGORIES: { key: "main-categories", ttl: 86400 }, // 24 hours
  SUB_CATEGORIES: { key: "sub-categories", ttl: 86400 }, // 24 hours
  SUB_SUB_CATEGORIES: { key: "sub-sub-categories", ttl: 86400 }, // 24 hours
  FEATURED_CATEGORIES: { key: "featured-categories", ttl: 86400 }, // 24 hours
  NAV_CATEGORIES: { key: "nav-categories", ttl: 86400 }, // 24 hours
  CATEGORY_BY_SLUG: { key: "category", ttl: 36000 }, // 10 hours
  SUB_CATEGORY_BY_SLUG: { key: "sub-category", ttl: 36000 }, // 10 hours
  SUB_SUB_CATEGORY_BY_SLUG: { key: "sub-sub-category", ttl: 36000 }, // 10 hours

  // Homepage caches
  HOME_SLIDERS: { key: "home-sliders", ttl: 86400 }, // 24 hours

  // User caches
  // ALL_USERS: { key: "all-users", ttl: 3600 }, // 1 hour
  // USER_BY_ID: { key: "user", ttl: 1800 }, // 30 minutes

  // Order caches
  ALL_ORDERS: { key: "all-orders", ttl: 1800 }, // 30 minutes
  ORDER_SUMMARY: { key: "order-summary", ttl: 3600 }, // 1 hour
  MY_ORDERS: { key: "my-orders", ttl: 1800 }, // 30 minutes

  // Review caches
  PRODUCT_REVIEWS: { key: "product-reviews", ttl: 3600 }, // 1 hour

  // Cart caches
  MY_CART: { key: "my-cart", ttl: 300 }, // 5 minutes
} as const;

// Helper function to get from cache or fetch from DB
export async function getCachedData<T>(
  cacheKey: string,
  fetchFunction: () => Promise<T>,
  ttlSeconds: number = 3600,
): Promise<T> {
  try {
    // Try to get from cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      // console.log(`✅ Cache HIT for key: ${cacheKey}`);
      return cached as T;
    }

    console.log(`❌ Cache MISS for key: ${cacheKey}`);
    // If not in cache, fetch from database
    const result = await fetchFunction();

    // Store in cache
    await redis.setex(cacheKey, ttlSeconds, JSON.stringify(result));
    console.log(`💾 Cached data for key: ${cacheKey} (TTL: ${ttlSeconds}s)`);

    return result;
  } catch (error) {
    console.error("🚨 Redis error, falling back to DB:", error);
    // If Redis fails, fallback to direct DB query
    return await fetchFunction();
  }
}

// Helper function to invalidate cache
export async function invalidateCache(...keys: string[]) {
  try {
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🗑️ Invalidated cache keys: ${keys.join(", ")}`);
    }
  } catch (error) {
    console.error("🚨 Error invalidating cache:", error);
  }
}

// Clear all keys matching a pattern
export async function clearCachePattern(pattern: string) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(
        `🧹 Cleared ${keys.length} cache keys matching pattern: ${pattern}`,
      );
    }
  } catch (error) {
    console.error("🚨 Error clearing cache pattern:", error);
  }
}

// Generate cache key with parameters
export function generateCacheKey(
  baseKey: string,
  params?: Record<string, any>,
): string {
  if (!params) return baseKey;

  const paramString = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b)) // Sort for consistent keys
    .map(([key, value]) => `${key}:${value}`)
    .join("|");

  return `${baseKey}-${paramString}`;
}

// Specific cache invalidation functions
export async function invalidateProductCaches() {
  await Promise.all([
    invalidateCache(CACHE_CONFIG.FEATURED_PRODUCTS.key),
    invalidateCache(CACHE_CONFIG.LATEST_PRODUCTS.key),
    clearCachePattern(`${CACHE_CONFIG.PRODUCT_BY_SLUG.key}-*`),
    clearCachePattern(`${CACHE_CONFIG.PRODUCT_BY_ID.key}-*`), // ADD THIS LINE
    clearCachePattern(`${CACHE_CONFIG.ALL_PRODUCTS.key}-*`),
  ]);
}

export async function invalidateCategoryCaches() {
  await Promise.all([
    invalidateCache(CACHE_CONFIG.MAIN_CATEGORIES.key),
    invalidateCache(CACHE_CONFIG.SUB_CATEGORIES.key),
    invalidateCache(CACHE_CONFIG.SUB_SUB_CATEGORIES.key),
    invalidateCache(CACHE_CONFIG.FEATURED_CATEGORIES.key),
    invalidateCache(CACHE_CONFIG.NAV_CATEGORIES.key),
    clearCachePattern(`${CACHE_CONFIG.CATEGORY_BY_SLUG.key}-*`),
    clearCachePattern(`${CACHE_CONFIG.SUB_CATEGORY_BY_SLUG.key}-*`), // ADD THIS LINE
    clearCachePattern(`${CACHE_CONFIG.SUB_SUB_CATEGORY_BY_SLUG.key}-*`), // ADD THIS LINE
  ]);
}

// export async function invalidateUserCaches() {
//   await Promise.all([
//     clearCachePattern(`${CACHE_CONFIG.ALL_USERS.key}-*`),
//     clearCachePattern(`${CACHE_CONFIG.USER_BY_ID.key}-*`),
//   ]);
// }

export async function invalidateOrderCaches(userId?: string) {
  await Promise.all(
    [
      clearCachePattern(`${CACHE_CONFIG.ALL_ORDERS.key}-*`),
      invalidateCache(CACHE_CONFIG.ORDER_SUMMARY.key),
      userId
        ? clearCachePattern(`${CACHE_CONFIG.MY_ORDERS.key}-${userId}-*`)
        : undefined,
    ].filter(Boolean),
  );
}

export async function invalidateReviewCaches(productId?: string) {
  await Promise.all(
    [
      productId
        ? invalidateCache(`${CACHE_CONFIG.PRODUCT_REVIEWS.key}-${productId}`)
        : undefined,
      clearCachePattern(`${CACHE_CONFIG.PRODUCT_REVIEWS.key}-*`),
    ].filter(Boolean),
  );
}

export async function invalidateCartCache(userId?: string, sessionId?: string) {
  const cacheKeys = [
    userId ? generateCacheKey(CACHE_CONFIG.MY_CART.key, { userId }) : undefined,
    sessionId
      ? generateCacheKey(CACHE_CONFIG.MY_CART.key, { sessionCartId: sessionId })
      : undefined,
  ].filter((key): key is string => Boolean(key));

  if (cacheKeys.length > 0) {
    await invalidateCache(...cacheKeys);
  }
}

export async function invalidateHomepageCaches() {
  await invalidateCache(CACHE_CONFIG.HOME_SLIDERS.key);
}

export { redis };
