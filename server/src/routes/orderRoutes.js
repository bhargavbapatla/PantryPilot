import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createOrder, getAllOrders, updateOrder, deleteOrder, getOrderById } from '../controllers/orderController.js';
    
const router = express.Router();

router.post('/', authMiddleware, createOrder);

router.get('/', authMiddleware, getAllOrders);

router.get('/:id', authMiddleware, getOrderById);

router.put('/:id', authMiddleware, updateOrder);

router.delete('/:id', authMiddleware, deleteOrder); 

export default router;
