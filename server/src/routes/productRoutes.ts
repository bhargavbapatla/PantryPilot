import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { createProduct, getAllProducts, updateProduct, deleteProduct } from '../controllers/productContoller.ts';       

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - makingCharge
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the product
 *         name:
 *           type: string
 *           description: The name of the product
 *         makingCharge:
 *           type: number
 *           description: The making charge of the product
 *         totalCostPrice:
 *           type: number
 *           description: The calculated total cost (making charge + ingredients cost)
 *         description:
 *           type: string
 *           description: The description of the product
 *         ingredients:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               inventoryId:
 *                 type: string
 *               quantity:
 *                 type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the product was added
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: The products managing API
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Returns the list of all products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of the products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - makingCharge
 *             properties:
 *               name:
 *                 type: string
 *               makingCharge:
 *                 type: number
 *               description:
 *                 type: string
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     inventoryId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *     responses:
 *       200:
 *         description: The created product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, getAllProducts);
router.post('/', authMiddleware, createProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product by id
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               makingCharge:
 *                 type: number
 *               description:
 *                 type: string
 *               ingredients:
 *                 type: object
 *     responses:
 *       200:
 *         description: The updated product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: The product was not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/:id', authMiddleware, updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Remove a product by id
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product id
 *     responses:
 *       200:
 *         description: The product was deleted
 *       404:
 *         description: The product was not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:id', authMiddleware, deleteProduct);

export default router
