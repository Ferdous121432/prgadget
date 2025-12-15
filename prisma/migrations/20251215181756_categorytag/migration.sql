-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "categoryTagId" TEXT;

-- CreateTable
CREATE TABLE "public"."CategoryTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "CategoryTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoryTag_name_key" ON "public"."CategoryTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryTag_slug_key" ON "public"."CategoryTag"("slug");

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_categoryTagId_fkey" FOREIGN KEY ("categoryTagId") REFERENCES "public"."CategoryTag"("id") ON DELETE SET NULL ON UPDATE CASCADE;
