-- CreateEnum
CREATE TYPE "Category" AS ENUM ('INGREDIENTS', 'PACKAGING');

-- AlterTable
ALTER TABLE "Inventory" ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'INGREDIENTS';
