-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "isLowStockAlert" BOOLEAN DEFAULT false,
    "lowStockThreshold" INTEGER,
    "expiryDate" TIMESTAMP(3),
    "expiresInDays" INTEGER,
    "expiryAlert" BOOLEAN DEFAULT false,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);
