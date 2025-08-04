"use server";

import { prisma } from "@/db/prisma";
import { LATEST_PRODUCTS_LIMIT } from "../constants";
// import { PrismaClient } from "../generated/prisma";

import { convertPrismaObjectToJSObject } from "../utils";

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
