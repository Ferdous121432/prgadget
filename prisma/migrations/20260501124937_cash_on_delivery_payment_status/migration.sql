-- AlterEnum
ALTER TYPE "OrderPaymentStatus" ADD VALUE 'COD';

-- Backfill existing cash-on-delivery orders so they stop showing as pending.
UPDATE "Order"
SET "paymentStatus" = 'COD'
WHERE "paymentMethod" = 'CashOnDelivery'
	AND "paymentStatus" = 'PENDING';

UPDATE "DeletedOrder"
SET "paymentStatus" = 'COD'
WHERE "paymentMethod" = 'CashOnDelivery'
	AND "paymentStatus" = 'PENDING';
