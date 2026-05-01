-- AlterTable
ALTER TABLE "User" ADD COLUMN     "selectedShippingAddressId" UUID;

-- CreateTable
CREATE TABLE "UserShippingAddress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'Home',
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "streetAddress" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "deliveryInstructions" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "UserShippingAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserShippingAddress_userId_isDefault_idx" ON "UserShippingAddress"("userId", "isDefault");

-- CreateIndex
CREATE INDEX "UserShippingAddress_userId_createdAt_idx" ON "UserShippingAddress"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_selectedShippingAddressId_fkey" FOREIGN KEY ("selectedShippingAddressId") REFERENCES "UserShippingAddress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserShippingAddress" ADD CONSTRAINT "UserShippingAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
