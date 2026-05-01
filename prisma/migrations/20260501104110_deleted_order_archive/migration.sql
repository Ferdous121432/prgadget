-- CreateTable
CREATE TABLE "DeletedOrder" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "originalOrderId" UUID NOT NULL,
    "userId" UUID,
    "userName" TEXT,
    "userEmail" TEXT,
    "shippingAddress" JSON NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentResult" JSON,
    "itemsPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "shippingPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "taxPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMPTZ(6),
    "isDelivered" BOOLEAN NOT NULL DEFAULT false,
    "deliveredAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedByUserId" UUID NOT NULL,
    "deletedByUserName" TEXT,
    "deletedByUserEmail" TEXT,

    CONSTRAINT "DeletedOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeletedOrderItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "deletedOrderId" UUID NOT NULL,
    "originalOrderId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "DeletedOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeletedOrder_originalOrderId_key" ON "DeletedOrder"("originalOrderId");

-- CreateIndex
CREATE INDEX "DeletedOrder_deletedAt_idx" ON "DeletedOrder"("deletedAt");

-- CreateIndex
CREATE INDEX "DeletedOrder_userEmail_idx" ON "DeletedOrder"("userEmail");

-- CreateIndex
CREATE INDEX "DeletedOrderItem_deletedOrderId_idx" ON "DeletedOrderItem"("deletedOrderId");

-- CreateIndex
CREATE INDEX "DeletedOrderItem_productId_idx" ON "DeletedOrderItem"("productId");

-- AddForeignKey
ALTER TABLE "DeletedOrderItem" ADD CONSTRAINT "DeletedOrderItem_deletedOrderId_fkey" FOREIGN KEY ("deletedOrderId") REFERENCES "DeletedOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
