/*
  Warnings:

  - Changed the type of `unit` on the `Inventory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('GRAMS', 'KGS', 'POUNDS', 'LITERS', 'PIECES');

-- AlterTable
ALTER TABLE "Inventory" DROP COLUMN "unit",
ADD COLUMN     "unit" "Unit" NOT NULL;
