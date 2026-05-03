"use server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  CACHE_CONFIG,
  generateCacheKey,
  getCachedData,
  invalidateProductCaches,
  invalidateReviewCaches,
} from "../cache/redis";
import { formatError } from "../utils";
import { insertReviewSchema } from "../validators";

// Create & Update Reviews
export async function createUpdateReview(
  data: z.infer<typeof insertReviewSchema>,
) {
  try {
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");

    // Validate and store the review
    const review = insertReviewSchema.parse({
      ...data,
      userId: session?.user?.id,
    });

    // Get product that is being reviewed
    const product = await prisma.product.findFirst({
      where: { id: review.productId },
    });

    if (!product) throw new Error("Product not found");

    const hasPurchasedProduct = Boolean(
      await prisma.orderItem.findFirst({
        where: {
          productId: review.productId,
          order: {
            userId: review.userId,
          },
        },
        select: {
          orderId: true,
        },
      }),
    );

    // Check if user already reviewed
    const reviewExists = await prisma.review.findFirst({
      where: {
        productId: review.productId,
        userId: review.userId,
      },
    });

    await prisma.$transaction(async (tx: any) => {
      if (reviewExists && session?.user?.id === review.userId) {
        // Update review
        await tx.review.update({
          where: { id: reviewExists.id },
          data: {
            title: review.title,
            description: review.description,
            rating: review.rating,
            isVerifiedPurchase: hasPurchasedProduct,
          },
        });
      } else {
        // Create review
        await tx.review.create({
          data: {
            ...review,
            isVerifiedPurchase: hasPurchasedProduct,
          },
        });
      }

      // Get avg rating
      const averageRating = await tx.review.aggregate({
        _avg: { rating: true },
        where: { productId: review.productId },
      });

      // Get number of reviews
      const numReviews = await tx.review.count({
        where: { productId: review.productId },
      });

      // Update the rating and numReviews in product table
      await tx.product.update({
        where: { id: review.productId },
        data: {
          rating: averageRating._avg.rating || 0,
          numReviews,
        },
      });
    });

    revalidatePath(`/product/${product.slug}`);

    // Invalidate review caches for this product
    await invalidateReviewCaches(review.productId);

    // Invalidate product caches since rating/numReviews changed
    await invalidateProductCaches();

    return {
      success: true,
      message: "Review Updated Successfully",
    };
  } catch (error) {
    // console.log("Error in createUpdateReview:", error);
    return { success: false, message: formatError(error) };
  }
}

// Get all reviews for a product with Redis cache
export async function getReviews({ productId }: { productId: string }) {
  const cacheKey = generateCacheKey(CACHE_CONFIG.PRODUCT_REVIEWS.key, {
    productId,
  });

  return getCachedData(
    cacheKey,
    async () => {
      try {
        const data = await prisma.review.findMany({
          where: {
            productId: productId,
          },
          include: {
            user: {
              select: {
                name: true,
                image: true, // Include user image for better UX
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return { success: true, data };
      } catch (error) {
        console.error("Error fetching reviews:", error);
        return { success: false, data: [], message: "Failed to fetch reviews" };
      }
    },
    CACHE_CONFIG.PRODUCT_REVIEWS.ttl,
  );
}

// Get a review written by the current user (no cache - personal data)
export async function getReviewByProductId({
  productId,
}: {
  productId: string;
}) {
  try {
    const session = await auth();

    if (!session) throw new Error("User is not authenticated");

    const review = await prisma.review.findFirst({
      where: {
        productId,
        userId: session?.user?.id,
      },
    });

    return { success: true, data: review };
  } catch (error) {
    console.error("Error fetching user review:", error);
    return {
      success: false,
      data: null,
      message: "Failed to fetch user review",
    };
  }
}

// Get review statistics for a product with Redis cache
export async function getReviewStats({ productId }: { productId: string }) {
  const cacheKey = generateCacheKey("product-review-stats", { productId });

  return getCachedData(
    cacheKey,
    async () => {
      try {
        // Get rating distribution
        const ratingDistribution = await prisma.review.groupBy({
          by: ["rating"],
          where: { productId },
          _count: { rating: true },
          orderBy: { rating: "desc" },
        });

        // Get average rating and total reviews
        const averageData = await prisma.review.aggregate({
          _avg: { rating: true },
          _count: { id: true },
          where: { productId },
        });

        return {
          success: true,
          data: {
            averageRating: averageData._avg.rating || 0,
            totalReviews: averageData._count.id,
            ratingDistribution: ratingDistribution.map((item) => ({
              rating: item.rating,
              count: item._count.rating,
            })),
          },
        };
      } catch (error) {
        console.error("Error fetching review stats:", error);
        return {
          success: false,
          data: null,
          message: "Failed to fetch review statistics",
        };
      }
    },
    CACHE_CONFIG.PRODUCT_REVIEWS.ttl,
  );
}

// Delete a review (Admin function)
export async function deleteReview(reviewId: string) {
  try {
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");

    // Get the review to find associated product
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { product: true },
    });

    if (!review) {
      return { success: false, message: "Review not found" };
    }

    // Check if user owns the review or is admin
    if (review.userId !== session.user?.id && session.user?.role !== "admin") {
      return { success: false, message: "Unauthorized to delete this review" };
    }

    await prisma.$transaction(async (tx) => {
      // Delete the review
      await tx.review.delete({
        where: { id: reviewId },
      });

      // Recalculate product rating and review count
      const averageRating = await tx.review.aggregate({
        _avg: { rating: true },
        where: { productId: review.productId },
      });

      const numReviews = await tx.review.count({
        where: { productId: review.productId },
      });

      // Update product with new stats
      await tx.product.update({
        where: { id: review.productId },
        data: {
          rating: averageRating._avg.rating || 0,
          numReviews,
        },
      });
    });

    revalidatePath(`/product/${review.product.slug}`);

    // Invalidate caches
    await invalidateReviewCaches(review.productId);
    await invalidateProductCaches();

    return { success: true, message: "Review deleted successfully" };
  } catch (error) {
    console.error("Error deleting review:", error);
    return { success: false, message: formatError(error) };
  }
}

// Get all reviews with pagination (Admin function)
export async function getAllReviews({
  page = 1,
  limit = 20,
  productId,
}: {
  page?: number;
  limit?: number;
  productId?: string;
} = {}) {
  const cacheKey = generateCacheKey("all-reviews", {
    page,
    limit,
    productId: productId || "all",
  });

  return getCachedData(
    cacheKey,
    async () => {
      try {
        const where = productId ? { productId } : {};

        const [reviews, totalCount] = await Promise.all([
          prisma.review.findMany({
            where,
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  image: true,
                },
              },
              product: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
          }),
          prisma.review.count({ where }),
        ]);

        return {
          success: true,
          data: reviews,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalItems: totalCount,
            hasNextPage: page < Math.ceil(totalCount / limit),
            hasPrevPage: page > 1,
          },
        };
      } catch (error) {
        console.error("Error fetching all reviews:", error);
        return {
          success: false,
          data: [],
          message: "Failed to fetch reviews",
        };
      }
    },
    1800, // 30 minutes TTL for admin data
  );
}
