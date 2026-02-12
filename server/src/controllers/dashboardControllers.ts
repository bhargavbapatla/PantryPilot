import pkg from 'express';
const { Request, Response } = pkg;
import { prisma } from "../config/db.ts";


export const getAllDashboardStatsController = async (req: Request, res: Response) => {
    try {
        const [
            totalInventoryCount,
            lowStockCount,
            pendingOrdersCount,
            inventoryItems
        ] = await Promise.all([

            prisma.inventory.count(),

            prisma.inventory.count({
                where: {
                    quantity: { lte: prisma.inventory.fields.lowStockThreshold }
                }
            }),

            prisma.order.count({
                where: { status: "pending" }
            }),

            prisma.inventory.findMany({
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
