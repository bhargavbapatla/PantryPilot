import pkg from 'express';
import { prisma } from "../config/db.ts";
const { Request, Response } = pkg;


export const getAllProducts = async (req: Request, res: Response) => {
    const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      totalCostPrice: true,
      makingCharge: true,
      ingredients: {
        select: {
          inventory: {
            select: {
              name: true 
            }
          }
        }
      }
    }
  });
    return res.status(200).json({
        message: 'Products fetched successfully',
        status: 200,
        data: products,
    })
}

export const getProductById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
        where: {
            id,
        }
    })
    if (!product) {
        return res.status(400).json({
            message: 'Product not found',
            status: 400,
        })
    }
    return res.status(200).json({
        message: 'Product fetched successfully',
        status: 200,
        product,
    })
}


const getWeightInGrams = (weight: number, unit: string): number => {
    switch (unit) {
        case 'GRAMS': return weight;
        case 'KGS': return weight * 1000;
        case 'POUNDS': return weight * 453.592;
        case 'LITERS': return weight * 1000;
        case 'PIECES': return weight;
        default: return weight;
    }
}

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, makingCharge, description, ingredients } = req.body;

        let totalIngredientsCost = 0;

        // Calculate total cost from ingredients
        if (ingredients && Array.isArray(ingredients)) {
            for (const item of ingredients) {
                if (item.inventoryId) {
                    const inventoryItem = await prisma.inventory.findUnique({
                        where: { id: item.inventoryId }
                    });
                    console.log("inventoryIteminventoryItem", inventoryItem);
                    if (inventoryItem) {
                        const totalWeightInGrams = (inventoryItem.quantity || 0) * getWeightInGrams(inventoryItem.weight || 0, inventoryItem.unit);
                        const pricePerGram = totalWeightInGrams > 0 ? (inventoryItem.price || 0) / totalWeightInGrams : 0;
                        totalIngredientsCost += pricePerGram * (item.quantityNeeded || 0);
                    }
                }
            }
        }

        const totalCostPrice = totalIngredientsCost + (makingCharge || 0);

        console.log("Total Ingredients Cost:", totalIngredientsCost);
        console.log("Total Cost Price:", totalCostPrice.toFixed(2));

        const product = await prisma.product.create({
            data: {
                name,
                makingCharge,
                description,
                totalCostPrice,
                ingredients: {
                    create: ingredients.map((i: any) => ({
                        inventoryId: i.inventoryId,
                        quantity: i.quantityNeeded
                    }))
                }
            },
            include: {
                ingredients: true
            }
        })

        return res.status(200).json({
            message: 'Product created successfully',
            status: 200,
            data: product,
        })
    } catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({
            message: 'Error creating product',
            status: 500,
            error
        });
    }
}

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, makingCharge, description, ingredients } = req.body;

        let totalIngredientsCost = 0;

        // Calculate total cost from ingredients
        if (ingredients && Array.isArray(ingredients)) {
            for (const item of ingredients) {
                if (item.inventoryId) {
                    const inventoryItem = await prisma.inventory.findUnique({
                        where: { id: item.inventoryId }
                    });
                    if (inventoryItem) {
                        const totalWeightInGrams = (inventoryItem.quantity || 0) * getWeightInGrams(inventoryItem.weight || 0, inventoryItem.unit);
                        const pricePerGram = totalWeightInGrams > 0 ? (inventoryItem.price || 0) / totalWeightInGrams : 0;
                        totalIngredientsCost += pricePerGram * (item.quantity || 0);
                    }
                }
            }
        }

        const totalCostPrice = totalIngredientsCost + (makingCharge || 0);

        const product = await prisma.product.update({
            where: {
                id,
            },
            data: {
                name,
                makingCharge,
                description,
                totalCostPrice,
                ingredients: {
                    deleteMany: {}, // Remove existing ingredients
                    create: ingredients.map((i: any) => ({ // Add new ingredients
                        inventoryId: i.inventoryId,
                        quantity: i.quantity
                    }))
                }
            },
            include: {
                ingredients: true
            }
        })
        return res.status(200).json({
            message: 'Product updated successfully',
            status: 200,
            product,
        })
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({
            message: 'Error updating product',
            status: 500,
            error
        });
    }
}

export const deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await prisma.product.delete({
        where: {
            id,
        }
    })
    return res.status(200).json({
        message: 'Product deleted successfully',
        status: 200,
        product,
    })
}