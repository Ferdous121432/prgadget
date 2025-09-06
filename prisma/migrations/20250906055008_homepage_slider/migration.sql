-- CreateTable
CREATE TABLE "public"."HomePageSlider" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "image" TEXT NOT NULL,
    "image_name" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "HomePageSlider_pkey" PRIMARY KEY ("id")
);
