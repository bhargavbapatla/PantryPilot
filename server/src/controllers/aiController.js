import pkg from "express";
import { prisma } from "../config/db.js";
import { sendOrderConfirmation } from "../services/whatsappService.js";
const { Request, Response } = pkg;

export const askAssistant = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: "Query is required" });
        }

        // 1. Fetch Context Data (The "Eyes")
        // We run these in parallel for speed
        const [allStock, lowStockItems, recentOrders] = await Promise.all([

            // Get all inventory (simplified)
            prisma.product.findMany({
                select: { name: true, totalCostPrice: true,  }
            }),

            // Get low stock
            prisma.inventory.findMany({
                where: { quantity: { lte: 10 } },
                select: { name: true, quantity: true, unit: true }
            }),

            // Get recent orders
            prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { customer: { select: { name: true } } }
            })
        ]);

        // 2. Call the AI Service (The "Brain")
        const aiResponse = await generateBakingAdvice(
            query,
            allStock,
            lowStockItems,
            recentOrders
        );

        // 3. Send Answer back to Frontend
        return res.status(200).json({
            message: 'AI response received successfully',
            status: 200,
            data: aiResponse,
        });

    } catch (error) {
        console.error("AI Controller Error:", error);
        return res.status(500).json({ error: "Something went wrong processing your request." });
    }
};