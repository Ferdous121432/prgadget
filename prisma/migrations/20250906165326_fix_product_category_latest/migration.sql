-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "mainCategoryId" TEXT,
ADD COLUMN     "subCategoryId" TEXT,
ADD COLUMN     "subSubCategoryId" TEXT;

-- CreateTable
CREATE TABLE "public"."MainCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT,
    "image_key" TEXT,

    CONSTRAINT "MainCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mainCategoryId" TEXT NOT NULL,

    CONSTRAINT "SubCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubSubCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subCategoryId" TEXT NOT NULL,

    CONSTRAINT "SubSubCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MainCategory_name_key" ON "public"."MainCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MainCategory_slug_key" ON "public"."MainCategory"("slug");

-- AddForeignKey
ALTER TABLE "public"."SubCategory" ADD CONSTRAINT "SubCategory_mainCategoryId_fkey" FOREIGN KEY ("mainCategoryId") REFERENCES "public"."MainCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubSubCategory" ADD CONSTRAINT "SubSubCategory_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "public"."SubCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_mainCategoryId_fkey" FOREIGN KEY ("mainCategoryId") REFERENCES "public"."MainCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "public"."SubCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_subSubCategoryId_fkey" FOREIGN KEY ("subSubCategoryId") REFERENCES "public"."SubSubCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
