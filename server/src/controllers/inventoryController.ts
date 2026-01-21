import pkg from 'express';
const { Request, Response } = pkg;
import { prisma } from "../config/db.ts";

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
    const { name, quantity, price, unit, isLowStockAlert, lowStockThreshold, weight } = req.body;
    const inventory = await prisma.inventory.create({
      data: {
        name,
        quantity,
        price,
        unit,
        isLowStockAlert,
        lowStockThreshold,
        weight,
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
    const inventory = await prisma.inventory.update({
      where: {
        id: id,
      },
      data: {
        name,
        quantity,
        price,
        unit,
        isLowStockAlert,
        lowStockThreshold,
        weight,
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
    console.log("PPPPPPPPPPP", req.params);
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
