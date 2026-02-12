import { prisma } from "../config/db.js";
import pkg from "express";
import { sendOrderConfirmation } from "../services/whatsappService.js";


const { Request, Response } = pkg;
    

const unitToGramsFactor = {
    GRAMS: 1,
    KGS: 1000,
    POUNDS: 453.592,
    LITERS: 1000,
    MILLILITERS: 1,
    PIECES: 1,
    BOXES: 1,
};

const toGrams = (value, unit) => {
    if (!unit) return value;
    const factor = unitToGramsFactor[unit] ?? 1;
    return value * factor;
};

// --- INVENTORY HELPERS ---

const deductInventoryForOrder = async (
    order,
    tx
) => {
    const requirements = {};

    for (const orderItem of order.orderItems) {
        if (!orderItem.product) continue;

        for (const ingredient of orderItem.product.ingredients) {
            const requiredQuantity = ingredient.quantity * orderItem.quantity;
            const requiredGrams = toGrams(requiredQuantity, ingredient.unit);

            if (!requirements[ingredient.inventoryId]) {
                requirements[ingredient.inventoryId] = 0;
            }
            requirements[ingredient.inventoryId] += requiredGrams;
        }
    }

    const inventoryIds = Object.keys(requirements);
    if (inventoryIds.length === 0) return;

    const inventories = await tx.inventory.findMany({
        where: { id: { in: inventoryIds } },
    });

    const inventoryMap = new Map();
    for (const inventory of inventories) {
        inventoryMap.set(inventory.id, {
            id: inventory.id,
            quantity: inventory.quantity,
            weight: inventory.weight,
            unit: inventory.unit,
            remainingStock: inventory.remainingStock,
        });
    }

    for (const inventoryId of inventoryIds) {
        const requiredGrams = requirements[inventoryId];
        const inventoryRecord = inventoryMap.get(inventoryId);

        if (!inventoryRecord) throw new Error("INVENTORY_NOT_FOUND");

        const unitWeightInGrams = toGrams(
            inventoryRecord.weight,
            inventoryRecord.unit
        );
        const newRemainingStock =
            inventoryRecord.remainingStock - requiredGrams;

        if (newRemainingStock < 0) throw new Error("INSUFFICIENT_INVENTORY");

        const newQuantity =
            unitWeightInGrams > 0
                ? Math.floor(newRemainingStock / unitWeightInGrams)
                : inventoryRecord.quantity;
        await tx.inventory.update({
            where: { id: inventoryRecord.id },
            data: {
                remainingStock: newRemainingStock,
                // quantity: newQuantity,
            },
        });
    }
};

// NEW: Restores inventory if an order is cancelled or reverted to pending
const restoreInventoryForOrder = async (
    order,
    tx
) => {
    const requirements = {};

    for (const orderItem of order.orderItems) {
        if (!orderItem.product) continue;

        for (const ingredient of orderItem.product.ingredients) {
            const requiredQuantity = ingredient.quantity * orderItem.quantity;
            const requiredGrams = toGrams(requiredQuantity, ingredient.unit);

            if (!requirements[ingredient.inventoryId]) {
                requirements[ingredient.inventoryId] = 0;
            }
            requirements[ingredient.inventoryId] += requiredGrams;
        }
    }

    const inventoryIds = Object.keys(requirements);
    if (inventoryIds.length === 0) return;

    const inventories = await tx.inventory.findMany({
        where: { id: { in: inventoryIds } },
    });

    const inventoryMap = new Map();
    for (const inventory of inventories) {
        inventoryMap.set(inventory.id, {
            id: inventory.id,
            quantity: inventory.quantity,
            weight: inventory.weight,
            unit: inventory.unit,
            remainingStock: inventory.remainingStock,
        });
    }

    for (const inventoryId of inventoryIds) {
        const requiredGrams = requirements[inventoryId];
        const inventoryRecord = inventoryMap.get(inventoryId);

        if (!inventoryRecord) continue;

        const unitWeightInGrams = toGrams(
            inventoryRecord.weight,
            inventoryRecord.unit
        );
        const newRemainingStock =
            inventoryRecord.remainingStock + requiredGrams;
        const newQuantity =
            unitWeightInGrams > 0
                ? Math.floor(newRemainingStock / unitWeightInGrams)
                : inventoryRecord.quantity;

        await tx.inventory.update({
            where: { id: inventoryRecord.id },
            data: {
                remainingStock: newRemainingStock,
                quantity: newQuantity,
            },
        });
    }
};


// --- CONTROLLERS ---

export const createOrder = async (req, res) => {
    try {
        const { customer, status, orderItems, orderDate, grandTotal, items } = req.body;
        const { name, phone, address, customerId } = customer;
        
        let customerResp;
        if (customerId) {
            customerResp = await prisma.customer.findUnique({
                where: { id: customerId },
            });
        } else {
            customerResp = await prisma.customer.create({
                data: { name, phone, address },
            });
        }

        const newOrder = await prisma.order.create({
            data: {
                customerName: name,
                grandTotal: Number(grandTotal),
                status: status || "Pending",
                orderDate: new Date(orderDate),
                customer: {
                    connect: { id: customerResp.id },
                },
                orderItems: {
                    create: items.map((item) => ({
                        product: { connect: { id: item.productId } },
                        quantity: Number(item.quantity),
                        sellingPrice: Number(item.sellingPrice),
                    })),
                },
                user: req.userId
                    ? {
                          connect: {
                              id: req.userId,
                          },
                      }
                    : undefined,
            },
            include: {
                orderItems: {
                    include: { product: true },
                },
                customer: true,
            },
        });

        await sendOrderConfirmation(
            customer.phone,
            customer.name,
            Number(grandTotal),
            newOrder.id
        );

        return res.status(200).json({
            message: 'Order created successfully',
            status: 200,
            data: newOrder,
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Error creating order',
            status: 400,
            error: error?.message ?? "Unknown error",
        });
    }
}

export const updateOrder = async (req, res) => {
    try {
        const { customer, status, orderDate, grandTotal, items } = req.body;
        const { name, phone, address, customerId } = customer;

        const order = await prisma.$transaction(async (tx) => {
            let customerResp;

            if (!customerId) {
                customerResp = await tx.customer.create({
                    data: { name, phone, address },
                });
            } else {
                customerResp = { id: customerId };
            }

            // 1. Fetch existing order WITH its old items to check if we need to restore stock
            const existingOrder = await tx.order.findFirst({
                where: {
                    id: req.params.id,
                    userId: req.userId,
                },
                include: {
                    orderItems: {
                        include: {
                            product: {
                                include: { ingredients: true },
                            },
                        },
                    },
                },
            });

            if (!existingOrder) throw new Error("ORDER_NOT_FOUND");

            const nextStatus = status || "PENDING";
            const wasOngoingOrCompleted = ["ONGOING", "COMPLETED"].includes(existingOrder.status.toUpperCase());
            console.log("wasOngoingOrCompleted",wasOngoingOrCompleted)
            
            // 2. If the order had already deducted stock, put it back before applying the updates
            // if (wasOngoingOrCompleted) {
            //     await restoreInventoryForOrder(existingOrder as unknown as OrderWithItems, tx);
            // }

            // 3. Update the order with the new items/data
            const updatedOrder = await tx.order.update({
                where: { id: req.params.id },
                data: {
                    customerName: name,
                    grandTotal: Number(grandTotal),
                    status: nextStatus,
                    orderDate: new Date(orderDate),
                    customer: {
                        connect: { id: customerResp.id },
                    },
                    orderItems: {
                        deleteMany: {},
                        create: items.map((item) => ({
                            product: { connect: { id: item.productId } },
                            quantity: Number(item.quantity),
                            sellingPrice: Number(item.sellingPrice),
                        })),
                    },
                },
                include: {
                    orderItems: {
                        include: {
                            product: {
                                include: { ingredients: true },
                            },
                        },
                    },
                    customer: true,
                },
            });

            // 4. If the NEW status requires stock to be pulled, deduct the updated amounts
            const isNowOngoingOrCompleted = ["ONGOING", "COMPLETED"].includes(nextStatus.toUpperCase());
            console.log("isNowOngoingOrCompleted",isNowOngoingOrCompleted)
            if (isNowOngoingOrCompleted) {
                await deductInventoryForOrder(updatedOrder, tx);
            }

            return updatedOrder;
        }, { timeout: 20000 });

        await sendOrderConfirmation(
            customer.phone,
            customer.name,
            Number(grandTotal),
            order.id
        );
        
        return res.status(200).json({
            message: "Order updated successfully",
            status: 200,
            data: order,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "ORDER_NOT_FOUND") {
                return res.status(404).json({ message: "Order not found", status: 404 });
            }
            if (error.message === "INSUFFICIENT_INVENTORY") {
                return res.status(400).json({ message: "Insufficient inventory for this order", status: 400 });
            }
            if (error.message === "INVENTORY_NOT_FOUND") {
                return res.status(400).json({ message: "Inventory item not found for this order", status: 400 });
            }
        }
        return res.status(400).json({
            message: "Error updating order",
            status: 400,
            error: error?.message ?? "Unknown error",
        });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                userId: req.userId ?? undefined,
            },
            include: {
                orderItems: {
                    include: { product: true }
                },
                customer: true
            }
        });
        return res.status(200).json({
            message: 'Orders fetched successfully',
            status: 200,
            data: orders,
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Error fetching orders',
            status: 400,
            error: error?.message ?? "Unknown error",
        });
    }
}

    export const getOrderById = async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.id },
        });
        return res.status(200).json({
            message: 'Order fetched successfully',
            status: 200,
            data: order,
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Error fetching order',
            status: 400,
            error: error?.message ?? "Unknown error",
        });
    }
}

export const deleteOrder = async (req, res) => {
    try {
        const existingOrder = await prisma.order.findFirst({
            where: {
                id: req.params.id,
                userId: req.userId,
            },
        });
        if (!existingOrder) {
            return res.status(404).json({
                message: "Order not found",
                status: 404,
            });
        }
        const order = await prisma.order.delete({
            where: { id: req.params.id },
        });
        return res.status(200).json({
            message: 'Order deleted successfully',
            status: 200,
            data: order,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "ORDER_NOT_FOUND") {
                return res.status(404).json({ message: "Order not found", status: 404 });
            }
        }
        return res.status(400).json({
            message: 'Error deleting order',
            status: 400,
            error: error?.message ?? "Unknown error",
        });
    }
}
