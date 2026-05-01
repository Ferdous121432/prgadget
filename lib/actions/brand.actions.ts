"use server";

import { prisma } from "@/db/prisma";
import { invalidateProductCaches } from "@/lib/cache/redis";
import { formatError } from "@/lib/utils";
import { CreateBrand, UpdateBrand } from "@/types";
import { revalidatePath } from "next/cache";
import { upsertProductVector } from "./vector-search.actions";

export async function createBrand(data: CreateBrand) {
  try {
    await prisma.brand.create({
      data,
    });

    revalidatePath("/admin/brands");

    return { success: true, message: "Brand created successfully." };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function updateBrand(data: UpdateBrand) {
  try {
    const updatedBrandProducts = await prisma.$transaction(async (tx) => {
      const brand = await tx.brand.update({
        where: { id: data.id },
        data,
      });

      await tx.product.updateMany({
        where: { brandId: brand.id },
        data: {
          brand: brand.name,
        },
      });

      return tx.product.findMany({
        where: { brandId: brand.id },
        include: {
          Brand: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          MainCategory: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          SubCategory: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          SubSubCategory: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });
    });

    revalidatePath("/admin/brands");
    revalidatePath("/admin/products");
    revalidatePath("/search");

    await invalidateProductCaches();
    await Promise.all(
      updatedBrandProducts.map((product) => upsertProductVector(product)),
    );

    return { success: true, message: "Brand updated successfully." };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function getBrandById(id: string) {
  try {
    return await prisma.brand.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getAllBrands() {
  try {
    const brands = await prisma.brand.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    return { success: true, data: brands };
  } catch (error) {
    return { success: false, data: [], message: formatError(error) };
  }
}

export async function getAdminBrandSummaries() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: {
        products: {
          select: {
            id: true,
            stock: true,
            price: true,
            createdAt: true,
            MainCategory: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: brands.map((brand) => {
        const categoryCounts = new Map<string, number>();
        let totalStock = 0;
        let outOfStockCount = 0;
        let totalPrice = 0;
        let latestProductAt: Date | null = null;

        for (const product of brand.products) {
          totalStock += product.stock;
          outOfStockCount += product.stock <= 0 ? 1 : 0;
          totalPrice += Number(product.price);

          if (!latestProductAt || product.createdAt > latestProductAt) {
            latestProductAt = product.createdAt;
          }

          const categoryName = product.MainCategory?.name ?? "Uncategorized";
          categoryCounts.set(
            categoryName,
            (categoryCounts.get(categoryName) ?? 0) + 1,
          );
        }

        return {
          id: brand.id,
          brand: brand.name,
          productCount: brand.products.length,
          totalStock,
          outOfStockCount,
          averagePrice:
            brand.products.length > 0 ? totalPrice / brand.products.length : 0,
          latestProductAt,
          categoryNames: Array.from(categoryCounts.entries())
            .sort((left, right) => right[1] - left[1])
            .slice(0, 3)
            .map(([name]) => name),
        };
      }),
    };
  } catch (error) {
    return { success: false, data: [], message: formatError(error) };
  }
}
