"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/db/prisma";
import { utapi } from "@/app/api/uploadthing/uploadthing";
import { convertPrismaObjectToJSObject } from "../utils";
import {
  getCachedData,
  generateCacheKey,
  CACHE_CONFIG,
  invalidateHomepageCaches,
} from "../cache/redis";

// Create a new homepage slider
export async function createHomeSlider(data: any) {
  try {
    const slider = await prisma.homePageSlider.create({
      data,
    });

    revalidatePath("/admin/homepage");

    // Invalidate homepage caches
    await invalidateHomepageCaches();

    return { success: true, message: "Slider created successfully." };
  } catch (error) {
    return { success: false, message: "Failed to create slider." };
  }
}

// Get all homepage sliders with Redis cache
export async function getAllHomeSliders() {
  return getCachedData(
    CACHE_CONFIG.HOME_SLIDERS.key,
    async () => {
      try {
        const sliders = await prisma.homePageSlider.findMany({
          orderBy: {
            createdAt: "desc",
          },
        });
        return convertPrismaObjectToJSObject(sliders);
      } catch (error) {
        console.error("Error fetching home sliders:", error);
        return [];
      }
    },
    CACHE_CONFIG.HOME_SLIDERS.ttl
  );
}

// Delete a homepage slider by ID
export async function deleteHomeSlider(id: string) {
  try {
    // First, find the slider to ensure it exists
    const slider = await prisma.homePageSlider.findUnique({
      where: { id },
    });

    if (!slider) {
      return { success: false, message: "Slider not found." };
    }

    // Delete image from UploadThing by its key
    if (slider.image_key) {
      await utapi.deleteFiles(slider.image_key);
    }

    // Delete the slider
    const deletedSlider = await prisma.homePageSlider.delete({
      where: { id },
    });

    // Revalidate the homepage to reflect the deletion
    revalidatePath("/admin/homepage");

    // Invalidate homepage caches
    await invalidateHomepageCaches();

    return { success: true, message: "Slider deleted successfully." };
  } catch (error) {
    console.log("Error deleting slider:", error);
    return { success: false, message: "Failed to delete slider." };
  }
}

// Update a homepage slider by ID
export async function updateHomeSlider(id: string, data: any) {
  try {
    const slider = await prisma.homePageSlider.findUnique({
      where: { id },
    });

    if (!slider) {
      return { success: false, message: "Slider not found." };
    }

    const updatedSlider = await prisma.homePageSlider.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/homepage");

    // Invalidate homepage caches
    await invalidateHomepageCaches();

    return { success: true, message: "Slider updated successfully." };
  } catch (error) {
    console.log("Error updating slider:", error);
    return { success: false, message: "Failed to update slider." };
  }
}

// Get homepage slider by ID with Redis cache
export async function getHomeSliderById(id: string) {
  const cacheKey = generateCacheKey("home-slider", { id });

  return getCachedData(
    cacheKey,
    async () => {
      try {
        const slider = await prisma.homePageSlider.findUnique({
          where: { id },
        });

        if (!slider) {
          return { success: false, message: "Slider not found." };
        }

        return { success: true, data: convertPrismaObjectToJSObject(slider) };
      } catch (error) {
        console.error("Error fetching slider:", error);
        return { success: false, message: "Failed to fetch slider." };
      }
    },
    3600 // 1 hour TTL for individual slider
  );
}
