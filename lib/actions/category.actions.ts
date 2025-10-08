"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/db/prisma";
import {
  CreateMainCategory,
  UpdateMainCategory,
  CreateSubCategory,
  UpdateSubCategory,
  CreateSubSubCategory,
  UpdateSubSubCategory,
} from "@/types";
import { convertPrismaObjectToJSObject } from "../utils";
import {
  getCachedData,
  invalidateCategoryCaches,
  generateCacheKey,
  CACHE_CONFIG,
} from "../cache/redis";

//MAIN CATEGORY ACTIONS

// create main category
export async function createMainCategory(data: CreateMainCategory) {
  try {
    const mainCategory = await prisma.mainCategory.create({
      data,
    });
    revalidatePath("/admin/categories");

    // Invalidate category caches
    await invalidateCategoryCaches();

    return { success: true, message: "Main category created successfully." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to create main category" };
  }
}

// update main category
export async function updateMainCategory(data: UpdateMainCategory) {
  try {
    const mainCategory = await prisma.mainCategory.update({
      where: { id: data.id },
      data,
    });
    revalidatePath("/admin/categories");

    // Invalidate category caches
    await invalidateCategoryCaches();

    return { success: true, message: "Main category updated successfully." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to update main category" };
  }
}

// delete main category
export async function deleteMainCategory(id: string) {
  try {
    const mainCategory = await prisma.mainCategory.delete({
      where: { id },
    });
    revalidatePath("/admin/categories");

    // Invalidate category caches
    await invalidateCategoryCaches();

    return { success: true, message: "Main category deleted successfully." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to delete main category" };
  }
}

// get all main categories with Redis cache
export async function getAllMainCategories() {
  return getCachedData(
    CACHE_CONFIG.MAIN_CATEGORIES.key,
    async () => {
      try {
        const mainCategories = await prisma.mainCategory.findMany({
          include: {
            subcategories: true,
          },
        });
        const totalcategories = await prisma.mainCategory.count();
        const totalPages = Math.ceil(totalcategories / 10);
        return { success: true, data: mainCategories, totalPages };
      } catch (error) {
        console.error(error);
        return {
          success: false,
          message: "Failed to retrieve main categories",
        };
      }
    },
    CACHE_CONFIG.MAIN_CATEGORIES.ttl
  );
}

// get main category by id
export async function getMainCategoryById(id: string) {
  try {
    const mainCategory = await prisma.mainCategory.findUnique({
      where: { id },
      include: {
        // subcategories: true,
      },
    });
    return mainCategory;
  } catch (error) {
    console.error(error);
    return null;
  }
}

//SUB CATEGORY ACTIONS

// create sub categories
export const createSubCategories = async (data: CreateSubCategory) => {
  try {
    const subCategory = await prisma.subCategory.create({
      data,
    });
    revalidatePath("/admin/sub-categories");

    // Invalidate category caches
    await invalidateCategoryCaches();

    return { success: true, message: "Sub category created successfully." };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create sub category",
    };
  }
};

// update sub category
export async function updateSubCategory(data: UpdateSubCategory) {
  try {
    const mainCategory = await prisma.subCategory.update({
      where: { id: data.id },
      data,
    });
    revalidatePath("/admin/sub-categories");

    // Invalidate category caches
    await invalidateCategoryCaches();

    return { success: true, message: "Sub category updated successfully." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to update sub category" };
  }
}

// delete sub category
export async function deleteSubCategory(id: string) {
  try {
    const subCategory = await prisma.subCategory.delete({
      where: { id },
    });
    revalidatePath("/admin/sub-categories");

    // Invalidate category caches
    await invalidateCategoryCaches();

    return { success: true, message: "Sub category deleted successfully." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to delete sub category" };
  }
}

// get all sub categories
export async function getAllSubCategories() {
  try {
    const subCategories = await prisma.subCategory.findMany({
      include: {
        mainCategory: true,
        subsubcategories: true,
      },
    });
    const totalcategories = await prisma.subCategory.count();
    const totalPages = Math.ceil(totalcategories / 10);
    return { success: true, data: subCategories, totalPages };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to retrieve sub categories" };
  }
}

// get sub category by id
export async function getSubCategoryById(id: string) {
  try {
    const subCategory = await prisma.subCategory.findUnique({
      where: { id },
      include: {
        mainCategory: true,
      },
    });
    return subCategory;
  } catch (error) {
    console.error(error);
    return null;
  }
}

//SUB SUB CATEGORY ACTIONS

// create sub sub categories
export const createSubSubCategories = async (data: CreateSubSubCategory) => {
  try {
    const subSubCategory = await prisma.subSubCategory.create({
      data,
    });
    revalidatePath("/admin/sub-sub-categories");

    // Invalidate category caches
    await invalidateCategoryCaches();

    return { success: true, message: "Sub-Sub category created successfully." };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create sub-sub category",
    };
  }
};

// update sub sub category
export async function updateSubSubCategory(data: UpdateSubSubCategory) {
  try {
    const subSubCategory = await prisma.subSubCategory.update({
      where: { id: data.id },
      data,
    });
    revalidatePath("/admin/sub-sub-categories");

    // Invalidate category caches
    await invalidateCategoryCaches();

    return { success: true, message: "Sub-Sub category updated successfully." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to update sub-sub category" };
  }
}

// delete sub sub category
export async function deleteSubSubCategory(id: string) {
  try {
    const subSubCategory = await prisma.subSubCategory.delete({
      where: { id },
    });
    revalidatePath("/admin/sub-sub-categories");

    // Invalidate category caches
    await invalidateCategoryCaches();

    return { success: true, message: "Sub-Sub category deleted successfully." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to delete sub-sub category" };
  }
}

// get all sub sub categories
export async function getAllSubSubCategories() {
  try {
    const subSubCategories = await prisma.subSubCategory.findMany({
      include: {
        subCategory: true,
      },
    });
    const totalcategories = await prisma.subSubCategory.count();
    const totalPages = Math.ceil(totalcategories / 10);
    return { success: true, data: subSubCategories, totalPages };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to retrieve sub-sub categories" };
  }
}

// get sub sub category by id
export async function getSubSubCategoryById(id: string) {
  try {
    const subSubCategory = await prisma.subSubCategory.findUnique({
      where: { id },
      include: {
        subCategory: true,
      },
    });
    return subSubCategory;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Get categories, sub categories, and sub sub categories for product form
export async function getCategoriesForProductForm() {
  try {
    const [mainCategories, subCategories, subSubCategories] = await Promise.all(
      [
        prisma.mainCategory.findMany(),
        prisma.subCategory.findMany(),
        prisma.subSubCategory.findMany(),
      ]
    );
    return { mainCategories, subCategories, subSubCategories };
  } catch (error) {
    console.error(error);
    return { mainCategories: [], subCategories: [], subSubCategories: [] };
  }
}

// get featured categories with Redis cache
export async function getFeaturedCategories() {
  return getCachedData(
    CACHE_CONFIG.FEATURED_CATEGORIES.key,
    async () => {
      try {
        const categories = await prisma.mainCategory.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          },
        });
        return { success: true, data: categories };
      } catch (error) {
        console.error(error);
        return {
          success: false,
          message: "Failed to retrieve featured categories",
        };
      }
    },
    CACHE_CONFIG.FEATURED_CATEGORIES.ttl
  );
}

// categories for navigation with Redis cache
export async function getNavCategories() {
  return getCachedData(
    CACHE_CONFIG.NAV_CATEGORIES.key,
    async () => {
      try {
        const categories = await prisma.mainCategory.findMany({
          include: {
            subcategories: {
              include: {
                subsubcategories: true,
              },
            },
          },
        });
        return categories;
      } catch (error) {
        console.error(error);
        return {
          success: false,
          message: "Failed to retrieve featured categories",
        };
      }
    },
    CACHE_CONFIG.NAV_CATEGORIES.ttl
  );
}

// get category by slug with Redis cache
export async function getCategoryBySlug(slug: string) {
  if (!slug) {
    return { success: false, message: "No slug provided" };
  }

  const cacheKey = generateCacheKey(CACHE_CONFIG.CATEGORY_BY_SLUG.key, {
    slug,
  });

  return getCachedData(
    cacheKey,
    async () => {
      try {
        const category = await prisma.mainCategory.findUnique({
          where: { slug },
          include: {
            products: { take: 10 },
          },
        });
        return { success: true, data: convertPrismaObjectToJSObject(category) };
      } catch (error) {
        console.error(error);
        return { success: false, message: "Failed to retrieve category" };
      }
    },
    CACHE_CONFIG.CATEGORY_BY_SLUG.ttl
  );
}

// get sub category by slug with Redis cache
export async function getSubCategoryBySlug(slug: string) {
  if (!slug) {
    return { success: false, message: "No slug provided" };
  }

  const cacheKey = generateCacheKey(CACHE_CONFIG.SUB_CATEGORY_BY_SLUG.key, {
    slug,
  });

  return getCachedData(
    cacheKey,
    async () => {
      try {
        const subCategory = await prisma.subCategory.findUnique({
          where: { slug },
          include: {
            products: { take: 10 },
          },
        });
        return {
          success: true,
          data: convertPrismaObjectToJSObject(subCategory),
        };
      } catch (error) {
        console.error(error);
        return { success: false, message: "Failed to retrieve sub category" };
      }
    },
    CACHE_CONFIG.SUB_CATEGORY_BY_SLUG.ttl
  );
}

// get sub sub category by slug with Redis cache
export async function getSubSubCategoryBySlug(slug: string) {
  if (!slug) {
    return { success: false, message: "No slug provided" };
  }
  const cacheKey = generateCacheKey(CACHE_CONFIG.SUB_SUB_CATEGORY_BY_SLUG.key, {
    slug,
  });
  return getCachedData(
    cacheKey,
    async () => {
      try {
        const subSubCategory = await prisma.subSubCategory.findUnique({
          where: { slug },
          include: {
            products: { take: 10 },
          },
        });
        return {
          success: true,
          data: convertPrismaObjectToJSObject(subSubCategory),
        };
      } catch (error) {
        console.error(error);
        return {
          success: false,
          message: "Failed to retrieve sub sub category",
        };
      }
    },
    CACHE_CONFIG.SUB_SUB_CATEGORY_BY_SLUG.ttl
  );
}
