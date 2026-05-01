-- CreateEnum
CREATE TYPE "OrderPaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "OrderFulfillmentStatus" AS ENUM ('PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED');

-- AlterTable
ALTER TABLE "DeletedOrder" ADD COLUMN     "fulfillmentStatus" "OrderFulfillmentStatus" NOT NULL DEFAULT 'PLACED',
ADD COLUMN     "paymentStatus" "OrderPaymentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "fulfillmentStatus" "OrderFulfillmentStatus" NOT NULL DEFAULT 'PLACED',
ADD COLUMN     "paymentStatus" "OrderPaymentStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "DeletedOrder_paymentStatus_idx" ON "DeletedOrder"("paymentStatus");

-- CreateIndex
CREATE INDEX "DeletedOrder_fulfillmentStatus_idx" ON "DeletedOrder"("fulfillmentStatus");

-- CreateIndex
CREATE INDEX "Order_paymentStatus_idx" ON "Order"("paymentStatus");

-- CreateIndex
CREATE INDEX "Order_fulfillmentStatus_idx" ON "Order"("fulfillmentStatus");
