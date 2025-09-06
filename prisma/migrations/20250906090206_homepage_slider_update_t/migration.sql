/*
  Warnings:

  - Added the required column `linked_url` to the `HomePageSlider` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."HomePageSlider" ADD COLUMN     "linked_url" TEXT NOT NULL;
