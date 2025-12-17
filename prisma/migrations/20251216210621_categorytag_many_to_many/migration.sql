/*
  Warnings:

  - You are about to drop the column `categoryTagSlug` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryTagSlug_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "categoryTagSlug";

-- CreateTable
CREATE TABLE "ProductCategoryTag" (
    "productId" UUID NOT NULL,
    "categoryTagId" TEXT NOT NULL,

    CONSTRAINT "ProductCategoryTag_pkey" PRIMARY KEY ("productId","categoryTagId")
);

-- AddForeignKey
ALTER TABLE "ProductCategoryTag" ADD CONSTRAINT "ProductCategoryTag_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategoryTag" ADD CONSTRAINT "ProductCategoryTag_categoryTagId_fkey" FOREIGN KEY ("categoryTagId") REFERENCES "CategoryTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
