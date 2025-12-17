/*
  Warnings:

  - You are about to drop the column `categoryTagId` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryTagId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "categoryTagId",
ADD COLUMN     "categoryTagSlug" TEXT;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryTagSlug_fkey" FOREIGN KEY ("categoryTagSlug") REFERENCES "CategoryTag"("slug") ON DELETE SET NULL ON UPDATE CASCADE;
