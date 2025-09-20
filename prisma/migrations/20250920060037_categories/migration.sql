/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `SubCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `SubSubCategory` will be added. If there are existing duplicate values, this will fail.
  - Made the column `image` on table `MainCategory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `image_key` on table `MainCategory` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `slug` to the `SubCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `SubSubCategory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."MainCategory" ALTER COLUMN "image" SET NOT NULL,
ALTER COLUMN "image_key" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."SubCategory" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."SubSubCategory" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SubCategory_slug_key" ON "public"."SubCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SubSubCategory_slug_key" ON "public"."SubSubCategory"("slug");
