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
        },
        include: {
            ingredients: {
                include: {
                    inventory: true
                }
            }
        }
    });

    if (!product) {
        return res.status(404).json({
            message: 'Product not found',
            status: 404,
        });
    }

    return res.status(200).json({
        message: 'Product fetched successfully',
        status: 200,
        data: product,
    });
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

        if (ingredients && Array.isArray(ingredients)) {
            for (const item of ingredients) {
                if (item.inventoryId) {
                    const inventoryItem = await prisma.inventory.findUnique({
                        where: { id: item.inventoryId }
                    });

                    if (!inventoryItem) {
                        return res.status(404).json({
                            status: 404,
                            success: false,
                            message: "Inventory item not found."
                        });
                    }

                    const inventoryItemBaseWeightInGrams = getWeightInGrams(inventoryItem.weight || 0, inventoryItem.unit);

                    const totalAvailableGrams = (inventoryItem.quantity || 0) * inventoryItemBaseWeightInGrams;

                    const quantityNeededInGrams = getWeightInGrams(item.quantityNeeded || 0, item.unit);

                    if (quantityNeededInGrams > totalAvailableGrams) {
                        return res.status(400).json({
                            status: 400,
                            success: false,
                            message: `Insufficient stock for ${inventoryItem.name}. You need ${quantityNeededInGrams}g, but only have ${totalAvailableGrams}g available.`
                        });
                    }

                    const pricePerGram = inventoryItemBaseWeightInGrams > 0
                        ? (inventoryItem.price || 0) / inventoryItemBaseWeightInGrams
                        : 0;

                    totalIngredientsCost += pricePerGram * quantityNeededInGrams;
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
                        quantity: i.quantityNeeded,
                        unit: i.unit,
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

                    if (!inventoryItem) {
                        return res.status(404).json({
                            status: 404,
                            success: false,
                            message: "Inventory item not found."
                        });
                    }

                    const inventoryItemBaseWeightInGrams = getWeightInGrams(inventoryItem.weight || 0, inventoryItem.unit);

                    const totalAvailableGrams = (inventoryItem.quantity || 0) * inventoryItemBaseWeightInGrams;

                    const quantityNeededInGrams = getWeightInGrams(item.quantityNeeded || 0, item.unit);

                    if (quantityNeededInGrams > totalAvailableGrams) {
                        return res.status(400).json({
                            status: 400,
                            success: false,
                            message: `Insufficient stock for ${inventoryItem.name}. You need ${quantityNeededInGrams}g, but only have ${totalAvailableGrams}g available.`
                        });
                    }

                    const pricePerGram = inventoryItemBaseWeightInGrams > 0
                        ? (inventoryItem.price || 0) / inventoryItemBaseWeightInGrams
                        : 0;

                    totalIngredientsCost += pricePerGram * quantityNeededInGrams;
                }
            }
        }

        const totalCostPrice = totalIngredientsCost + (makingCharge || 0);

        console.log("Total Ingredients Cost:", totalIngredientsCost);
        console.log("Total Cost Price:", totalCostPrice.toFixed(2));
        console.log("ingredients:", ingredients);

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
                        quantity: i.quantityNeeded,
                        unit: i.unit,
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
            data: product,
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
        data: product,
    })
}