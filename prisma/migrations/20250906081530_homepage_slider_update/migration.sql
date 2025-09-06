/*
  Warnings:

  - You are about to drop the column `image` on the `HomePageSlider` table. All the data in the column will be lost.
  - Added the required column `image_key` to the `HomePageSlider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_url` to the `HomePageSlider` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."HomePageSlider" DROP COLUMN "image",
ADD COLUMN     "image_key" TEXT NOT NULL,
ADD COLUMN     "image_url" TEXT NOT NULL;
