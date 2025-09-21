"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/db/prisma";
import { UTApi } from "uploadthing/server";
import { utapi } from "@/app/api/uploadthing/uploadthing";
import { convertPrismaObjectToJSObject } from "../utils";

// Create a new homepage slider
export async function createHomeSlider(data: any) {
  try {
    const slider = await prisma.homePageSlider.create({
      data,
    });

    revalidatePath("/admin/homepage");

    return { success: true, message: "Slider created successfully." };
  } catch (error) {
    return { success: false, message: "Failed to create slider." };
  }
}

//get all homepage sliders
export async function getAllHomeSliders() {
  try {
    const sliders = await prisma.homePageSlider.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return convertPrismaObjectToJSObject(sliders);
  } catch (error) {
    return [];
  }
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

    return { success: true, message: "Slider deleted successfully." };
  } catch (error) {
    console.log("Error deleting slider:", error);
    return { success: false, message: "Failed to delete slider." };
  }
}
