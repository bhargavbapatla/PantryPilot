import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { getAllDashboardStatsController } from '../controllers/dashboardControllers.ts';

const router = express.Router();
router.get('/alldashboardStats', authMiddleware, getAllDashboardStatsController);

/**
 * @swagger
 * /dashboard/alldashboardStats:
 *   get:
 *     summary: Get all dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalInventoryCount:
 *                   type: integer
 *                 lowStockCount:
 *                   type: integer
 *                 pendingOrdersCount:
 *                   type: integer
 *                 inventoryItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                       price:
 *                         type: number
 *                       lowStockThreshold:
 *                         type: integer
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *       500:
 *         description: Server Error
 */

export default router;