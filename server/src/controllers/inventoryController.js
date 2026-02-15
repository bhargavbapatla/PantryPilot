import pkg from 'express';
const { Request, Response } = pkg;
import { prisma } from "../config/db.js";

const unitToBaseFactor = {
  GRAMS: 1,
  KGS: 1000,
  POUNDS: 453.592,
  LITERS: 1000,
  MILLILITERS: 1,
  PIECES: 1,
  BOXES: 1,
};

const calculateRemainingStock = (
  quantity,
  weight,
  unit
) => {
  if (!quantity || !weight) {
    return 0;
  }

  if (unit === 'LITERS' || unit === 'MILLILITERS') {
    const mlPerUnit = weight * unitToBaseFactor[unit];
    return quantity * mlPerUnit;
  }

  const gramsPerUnit = weight * unitToBaseFactor[unit];
  return quantity * gramsPerUnit;
};

export const getInventory = async (req, res) => {
  try {
    const inventory = await prisma.inventory.findMany({
      where: {
        userId: req.userId ?? undefined,
      },
    });
    return res.status(200).json({
      message: 'Inventory fetched successfully',
      status: 200,
      data: inventory,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      status: 500,
      // error: error.message,
    });
  }
};

export const createInventory = async (req, res) => {
  try {
    const { name, quantity, price, unit, isLowStockAlert, lowStockThreshold, weight, category, lowStockThresholdUnit } = req.body;
    const numericQuantity = Number(quantity) || 0;
    const numericWeight = Number(weight) || 0;
    const remainingStock = calculateRemainingStock(
      numericQuantity,
      numericWeight,
      unit
    );
    const inventory = await prisma.inventory.create({
      data: {
        name,
        quantity,
        price,
        unit,
        isLowStockAlert,
        lowStockThreshold,
        lowStockThresholdUnit,
        weight,
        category,
        remainingStock,
        user: req.userId
          ? {
              connect: {
                id: req.userId,
              },
            }
          : undefined,
      },
    });
    return res.status(200).json({
      message: 'Inventory created successfully',
      status: 200,
      data: inventory,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      status: 500,
      // error: error.message,
    });   
  }
};

export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, price, unit, isLowStockAlert, lowStockThreshold, weight, lowStockThresholdUnit } = req.body;
    const numericQuantity = Number(quantity) || 0;
    const numericWeight = Number(weight) || 0;
    const existing = await prisma.inventory.findFirst({
      where: {
        id: id,
        userId: req.userId,
      },
    });
    if (!existing) {
      return res.status(404).json({
        message: 'Inventory not found',
        status: 404,
      });
    }
    const inventory = await prisma.inventory.update({
      where: {
        id: id,
      },
      data: {
        name,
        quantity: numericQuantity,
        price,
        unit: unit,
        isLowStockAlert,
        lowStockThreshold,
        lowStockThresholdUnit,
        weight: numericWeight,
      },
    });
    return res.status(200).json({
      message: 'Inventory updated successfully',
      status: 200,
      data: inventory,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      status: 500,
      // error: error.message,
    });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.inventory.findFirst({
      where: {
        id: id,
        userId: req.userId,
      },
    });
    if (!existing) {
      return res.status(404).json({
        message: 'Inventory not found',
        status: 404,
      });
    }
    const inventory = await prisma.inventory.delete({
      where: {
        id: id,
      },
    });
    return res.status(200).json({
      message: 'Inventory deleted successfully',
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      status: 500,
      // error: error.message,
    });
  }
};

export const restockInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { addedQuantity, addedWeight, addedUnit, newPrice } = req.body;

    const numericAddedQuantity = Number(addedQuantity) || 0;
    const numericAddedWeight = Number(addedWeight) || 1; // Default to 1 for boxes/pieces
    const numericNewPrice = Number(newPrice) || 0;

    if (numericAddedQuantity <= 0) {
      return res.status(400).json({ message: "Added quantity must be greater than 0" });
    }

    const existing = await prisma.inventory.findFirst({
      where: { id: id, userId: req.userId }, 
    });

    if (!existing) {
      return res.status(404).json({ message: 'Inventory not found' });
    }

    let stockToAdd = 0;
    let packsToAdd = 0;

    const isDiscrete = existing.category === 'PACKAGING' || existing.unit === 'BOXES' || existing.unit === 'PIECES';

    if (isDiscrete) {
      // For discrete items, weight doesn't matter. 10 new boxes = 10 added to stock.
      stockToAdd = numericAddedQuantity;
      packsToAdd = numericAddedQuantity;
    } else {
      // 1. Calculate total raw volume bought (e.g., 1 sack * 10 * 1000 = 10,000 grams)
      // Fallback to 1 if the unit isn't found in the map
      const restockedBaseValue = numericAddedQuantity * numericAddedWeight * (unitToBaseFactor[addedUnit] || 1);
      stockToAdd = restockedBaseValue;

      // 2. Translate that back into "packs" based on your original item configuration
      // e.g., Original item is 100g. 10,000g / 100g = 100 packs effectively added.
      const existingBaseWeightPerPack = existing.weight * (unitToBaseFactor[existing.unit] || 1);
      packsToAdd = existingBaseWeightPerPack > 0 ? Math.round(restockedBaseValue / existingBaseWeightPerPack) : 0;
    }

    // 3. Update the database cumulatively
    const updatedInventory = await prisma.inventory.update({
      where: { id: id },
      data: {
        quantity: existing.quantity + packsToAdd, 
        price: existing.price + numericNewPrice,
        remainingStock: (existing.remainingStock || 0) + stockToAdd, 
      },
    });

    return res.status(200).json({
      message: 'Stock replenished successfully!',
      status: 200,
      data: updatedInventory,
    });

  } catch (error) {
    console.error("Restock Error:", error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};