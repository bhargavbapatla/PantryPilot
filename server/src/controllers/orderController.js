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
            let requiredGrams = 0;
            if (ingredient.category == "INGREDIENT") {
                requiredGrams = toGrams(requiredQuantity, ingredient.unit);
            } else {
                requiredGrams = requiredQuantity;
            }

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
        const userId = req.userId;

        // 1. OPTIMIZATION: Prepare IDs for bulk fetching
        const productIds = items.map(item => item.productId);

        const result = await prisma.$transaction(async (tx) => {

            // --- STEP A: Bulk Fetch Products (The Speed Fix) 🚀 ---
            // Instead of looping, we get everything in ONE query
            const products = await tx.product.findMany({
                where: { id: { in: productIds } },
                include: { ingredients: true }
            });

            // Create a quick lookup map for products
            const productMap = new Map(products.map(p => [p.id, p]));

            // --- STEP B: Calculate Ingredients Needed (In Memory) ---
            const ingredientUsage = new Map(); // Map<InventoryId, AmountNeeded>

            for (const item of items) {
                const product = productMap.get(item.productId);
                
                if (!product) throw new Error(`Product ID ${item.productId} not found`);

                for (const ing of product.ingredients) {
                    const currentNeeded = ingredientUsage.get(ing.inventoryId) || 0;
                    const totalNeeded = currentNeeded + (ing.quantity * Number(item.quantity));
                    ingredientUsage.set(ing.inventoryId, totalNeeded);
                }
            }

            // --- STEP C: Bulk Fetch Inventory (Another Speed Fix) 🚀 ---
            // Get all needed inventory items in ONE query
            const inventoryIds = Array.from(ingredientUsage.keys());
            const inventoryItems = await tx.inventory.findMany({
                where: { id: { in: inventoryIds } }
            });

            const inventoryMap = new Map(inventoryItems.map(i => [i.id, i]));

            // --- STEP D: Validate Stock (In Memory) ---
            for (const [inventoryId, amountNeeded] of ingredientUsage.entries()) {
                const stockItem = inventoryMap.get(inventoryId);

                if (!stockItem) throw new Error(`Ingredient details missing for ID: ${inventoryId}`);

                const currentStock = stockItem.remainingStock || 0;
                
                if (currentStock < amountNeeded) {
                    throw new Error(
                        `Insufficient Stock for "${stockItem.name}". \nNeed: ${amountNeeded} ${stockItem.unit}\nHave: ${currentStock} ${stockItem.unit}`
                    );
                }
                
                // Note: We still need individual updates for deduction, but they are fast
                // because we've already validated everything.
                // Optimistically, you could do this in parallel, but sequential is safer for locks.
                //  await tx.inventory.update({
                //     where: { id: inventoryId },
                //     data: { remainingStock: { decrement: amountNeeded } }
                // });
            }

            // --- STEP E: Handle Customer ---
            let customerResp;
            if (customerId) {
                customerResp = await tx.customer.findUnique({ where: { id: customerId } });
            } else {
                const customerData = { name, phone, address };
                if (userId) customerData.user = { connect: { id: userId } };
                
                customerResp = await tx.customer.create({ data: customerData });
            }

            // --- STEP F: Create Order ---
            return await tx.order.create({
                data: {
                    customerName: name,
                    grandTotal: Number(grandTotal),
                    status: status || "PENDING",
                    orderDate: new Date(orderDate),
                    customer: { connect: { id: customerResp.id } },
                    orderItems: {
                        create: items.map((item) => ({
                            product: { connect: { id: item.productId } },
                            quantity: Number(item.quantity),
                            sellingPrice: Number(item.sellingPrice),
                        })),
                    },
                    user: userId ? { connect: { id: userId } } : undefined,
                },
                include: {
                    orderItems: { include: { product: true } },
                    customer: true,
                }
            });

        }, { 
            maxWait: 5000, // Wait up to 5s to get a transaction
            timeout: 10000 // Transaction itself can take 10s (reduced from 20s as this is faster)
        });

        // SMS Logic remains the same...
        try {
            await sendOrderConfirmation(
                customer.phone,
                customer.name,
                Number(grandTotal),
                result.id
            );
        } catch (smsError) {
            console.error("SMS Failed but order created:", smsError);
        }

        return res.status(200).json({
            message: 'Order created successfully',
            status: 200,
            data: result,
        });

    } catch (error) {
        console.error("Order Creation Failed:", error);
        return res.status(400).json({
            message: error.message || 'Error creating order',
            status: 400,
            error: error?.message ?? "Unknown error",
        });
    }
};

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
            console.log("wasOngoingOrCompleted", wasOngoingOrCompleted)

            const productIds = items.map((item) => item.productId);

            const products = await tx.product.findMany({
                where: { id: { in: productIds } },
                include: { ingredients: true },
            });

            const productMap = new Map(products.map((p) => [p.id, p]));

            const ingredientUsage = new Map();

            for (const item of items) {
                const product = productMap.get(item.productId);

                if (!product) {
                    throw new Error(`Product ID ${item.productId} not found`);
                }

                for (const ing of product.ingredients) {
                    const currentNeeded = ingredientUsage.get(ing.inventoryId) || 0;
                    const totalNeeded = currentNeeded + ing.quantity * Number(item.quantity);
                    ingredientUsage.set(ing.inventoryId, totalNeeded);
                }
            }

            const inventoryIds = Array.from(ingredientUsage.keys());
            const inventoryItems = await tx.inventory.findMany({
                where: { id: { in: inventoryIds } },
            });

            const inventoryMap = new Map(inventoryItems.map((i) => [i.id, i]));

            for (const [inventoryId, amountNeeded] of ingredientUsage.entries()) {
                const stockItem = inventoryMap.get(inventoryId);

                if (!stockItem) {
                    throw new Error(`Ingredient details missing for ID: ${inventoryId}`);
                }

                const currentStock = stockItem.remainingStock || 0;

                if (currentStock < amountNeeded) {
                    throw new Error(
                        `Insufficient Stock for "${stockItem.name}". \nNeed: ${amountNeeded} ${stockItem.unit}\nHave: ${currentStock} ${stockItem.unit}`
                    );
                }
            }

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
            console.log("isNowOngoingOrCompleted", isNowOngoingOrCompleted)
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
        const message = error instanceof Error ? (error.message ?? "Unknown error") : "Unknown error";

        if (message.startsWith('Insufficient Stock for "')) {
            return res.status(400).json({
                message,
                status: 400,
            });
        }

        if (message === "ORDER_NOT_FOUND") {
            return res.status(404).json({ message: "Order not found", status: 404 });
        }

        if (message === "INSUFFICIENT_INVENTORY") {
            return res.status(400).json({ message: "Insufficient inventory for this order", status: 400 });
        }

        if (message === "INVENTORY_NOT_FOUND") {
            return res.status(400).json({ message: "Inventory item not found for this order", status: 400 });
        }

        return res.status(400).json({
            message: "Error updating order",
            status: 400,
            error: message,
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
