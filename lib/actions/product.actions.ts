"use server";

import { prisma } from "@/db/prisma";
import { DB_ADMIN_PRODUCT_TAKE, LATEST_PRODUCTS_LIMIT } from "../constants";
// import { PrismaClient } from "../generated/prisma";

import { convertPrismaObjectToJSObject } from "../utils";
import { revalidatePath } from "next/cache";
import { Product, ProductWithId } from "@/types";
import { success } from "zod";

// Get latest products

export async function getLatestProducts() {
  // const prisma = new PrismaClient();

  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: {
      createdAt: "desc",
    },
  });
  return convertPrismaObjectToJSObject(data);
}

//Get single product by slug
export async function getProductBySlug(slug: string) {
  // const prisma = new PrismaClient();

  const data = await prisma.product.findFirst({
    where: {
      slug,
    },
  });
  return convertPrismaObjectToJSObject(data);
}

// Get all products with pagination and search
export async function getAllProducts({
  query,
  page,
  category,
}: {
  query?: string;
  page: number;
  category?: string;
}) {
  try {
    const limit = DB_ADMIN_PRODUCT_TAKE; // Set your desired limit per page
    const skip = (page - 1) * limit;

    const data = await prisma.product.findMany({
      skip,
      take: limit,
    });
    const totalCount = await prisma.product.count();
    const totalPages = Math.ceil(totalCount / limit);

    return {
      data,
      totalPages,
    };
  } catch (error) {
    return { success: false, message: "Failed to fetch products." };
  }
}

// Delete product by ID
export async function deleteProduct(id: string) {
  try {
    const productExists = await prisma.product.findUnique({
      where: {
        id,
      },
    });
    if (!productExists) {
      return { success: false, message: "Product not found." };
    }

    const data = await prisma.product.delete({
      where: {
        id,
      },
    });

    revalidatePath("/admin/products");

    return { success: true, message: "Product deleted successfully." };
  } catch (error) {
    return { success: false, message: "Failed to delete product." };
  }
}

//Create a new product
export async function createProduct(data: Product) {
  try {
    const product = await prisma.product.create({
      data,
    });

    revalidatePath("/admin/products");

    return { success: true, message: "Product created successfully." };
  } catch (error) {
    return { success: false, message: "Failed to create product." };
  }
}

// Update product by ID
export async function updateProduct(data: ProductWithId) {
  try {
    const productExists = await prisma.product.findUnique({
      where: {
        id: data.id,
      },
    });
    if (!productExists) {
      return { success: false, message: "Product not found." };
    }

    const updatedProduct = await prisma.product.update({
      where: {
        id: data.id,
      },
      data,
    });

    revalidatePath("/admin/products");

    return { success: true, message: "Product updated successfully." };
  } catch (error) {
    return { success: false, message: "Failed to update product." };
  }
}
