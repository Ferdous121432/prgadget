"use server";

import { prisma } from "@/db/prisma";
import { CreateCategoryTag } from "@/types";
import { revalidatePath } from "next/cache";
import { invalidateCategoryCaches } from "../cache/redis";

// create category tags
export const createCategoryTag = async (data: CreateCategoryTag) => {
  try {
    const { id, createdAt, updatedAt, ...updateData } = data;

    const categoryTag = await prisma.categoryTag.create({
      data: updateData,
    });
    revalidatePath("/admin/category-tags");

    return { success: true, message: "Sub-Sub category created successfully." };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create sub-sub category",
    };
  }
};

// update category tag
export async function updateCategoryTag(data: CreateCategoryTag) {
  try {
    const { slug, id, createdAt, updatedAt, ...updateData } = data;

    const categoryTag = await prisma.categoryTag.update({
      where: { slug },
      data: updateData,
    });
    revalidatePath("/admin/category-tags");

    return { success: true, message: "Category tag updated successfully." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to update category tags" };
  }
}

// delete category tag
export async function deleteCategoryTag(slug: string) {
  try {
    const categoryTag = await prisma.categoryTag.delete({
      where: { slug },
    });
    revalidatePath("/admin/category-tags");

    // Invalidate category caches
    await invalidateCategoryCaches();

    return { success: true, message: "Category tag deleted successfully." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to delete category tag" };
  }
}

// get all category tags
export async function getAllCategoryTags() {
  try {
    const categoryTags = await prisma.categoryTag.findMany({
      orderBy: { createdAt: "desc" },
    });
    const totalcategories = await prisma.categoryTag.count();
    const totalPages = Math.ceil(totalcategories / 10);
    return { success: true, data: categoryTags, totalPages };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to retrieve category tags" };
  }
}

// get category tag by id
export async function getCategoryTagBySlug(slug: string) {
  if (!slug) {
    console.error("getCategoryTagBySlug called with undefined slug");
    return null;
  }

  try {
    const categoryTag = await prisma.categoryTag.findUnique({
      where: { slug },
    });
    return categoryTag;
  } catch (error) {
    console.error(error);
    return null;
  }
}
