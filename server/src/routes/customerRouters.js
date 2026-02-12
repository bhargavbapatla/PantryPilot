import express from 'express';
import { createCustomer, deleteCustomer, getCustomers, updateCustomer } from '../controllers/customerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', authMiddleware, createCustomer);
router.get('/', authMiddleware, getCustomers);
router.put('/:id', authMiddleware, updateCustomer);
router.delete('/:id', authMiddleware, deleteCustomer);

export default router;
