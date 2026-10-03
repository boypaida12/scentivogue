-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isSaleActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "saleEndDate" TIMESTAMP(3),
ADD COLUMN     "saleStartDate" TIMESTAMP(3);
