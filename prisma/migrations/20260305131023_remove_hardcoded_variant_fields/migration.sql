/*
  Warnings:

  - You are about to drop the column `color` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `customAttributes` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `fragrance` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `material` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `ProductVariant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "color",
DROP COLUMN "customAttributes",
DROP COLUMN "fragrance",
DROP COLUMN "material",
DROP COLUMN "size",
ADD COLUMN     "attributes" JSONB NOT NULL DEFAULT '{}';
