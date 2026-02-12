import pkg from 'express';
const { Request, Response } = pkg;
import { prisma } from "../config/db.js";


export const getAllDashboardStatsController = async (req, res) => {
    try {
        const userFilter = req.userId
            ? {
                  userId: req.userId,
              }
            : {};

        const [
            totalInventoryCount,
            lowStockCount,
            pendingOrdersCount,
            inventoryItems
        ] = await Promise.all([

            prisma.inventory.count({
                where: userFilter,
            }),

            prisma.inventory.count({
                where: {
                    ...userFilter,
                    quantity: { lte: prisma.inventory.fields.lowStockThreshold }
                }
            }),

            prisma.order.count({
                where: {
                    ...userFilter,
                    status: "pending",
                }
            }),

            prisma.inventory.findMany({
                where: userFilter,
                select: { price: true, quantity: true, name: true, lowStockThreshold: true }
            })
        ]);
        console.log("Dashboard Stats", totalInventoryCount,
            lowStockCount,
            pendingOrdersCount,
            inventoryItems);

        return res.status(200).json({
            totalInventoryCount,
            lowStockCount,
            pendingOrdersCount,
            inventoryItems
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
}
