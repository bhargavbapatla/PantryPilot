import pkg from 'express';
const { Request, Response } = pkg;
import { prisma } from "../config/db.ts";

type Unit =
  | 'GRAMS'
  | 'KGS'
  | 'POUNDS'
  | 'LITERS'
  | 'MILLILITERS'
  | 'PIECES'
  | 'BOXES';

const unitToBaseFactor: Record<Unit, number> = {
  GRAMS: 1,
  KGS: 1000,
  POUNDS: 453.592,
  LITERS: 1000,
  MILLILITERS: 1,
  PIECES: 1,
  BOXES: 1,
};

const calculateRemainingStock = (
  quantity: number,
  weight: number,
  unit: Unit
): number => {
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

export const getInventory = async (req: Request, res: Response) => {
  try {
    const inventory = await prisma.inventory.findMany();
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

export const createInventory = async (req: Request, res: Response) => {
  try {
    const { name, quantity, price, unit, isLowStockAlert, lowStockThreshold, weight, category } = req.body;
    const numericQuantity = Number(quantity) || 0;
    const numericWeight = Number(weight) || 0;
    const remainingStock = calculateRemainingStock(
      numericQuantity,
      numericWeight,
      unit as Unit
    );
    const inventory = await prisma.inventory.create({
      data: {
        name,
        quantity,
        price,
        unit,
        isLowStockAlert,
        lowStockThreshold,
        weight,
        category,
        remainingStock,
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

export const updateInventory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, quantity, price, unit, isLowStockAlert, lowStockThreshold, weight } = req.body;
    const numericQuantity = Number(quantity) || 0;
    const numericWeight = Number(weight) || 0;
    const remainingStock = calculateRemainingStock(
      numericQuantity,
      numericWeight,
      unit as Unit
    );
    const inventory = await prisma.inventory.update({
      where: {
        id: id,
      },
      data: {
        name,
        quantity: numericQuantity,
        price,
        unit: unit as Unit,
        isLowStockAlert,
        lowStockThreshold,
        weight: numericWeight,
        remainingStock,
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

export const deleteInventory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
    return res.status(500).json({ error: 'Internal server error' });
  }
};
