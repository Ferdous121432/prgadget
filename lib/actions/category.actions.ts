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
import { z } from "zod";
import { jsxToasts } from "@/lib/customToaster";

// create main category
export async function createMainCategory(data: CreateMainCategory) {
  try {
    const mainCategory = await prisma.mainCategory.create({
      data,
    });
    revalidatePath("/admin/categories");
    return { success: true, message: "Main category created successfully." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to create main category" };
  }
}
