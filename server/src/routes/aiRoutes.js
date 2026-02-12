import express from 'express';
import { askAssistant } from '../controllers/aiController.js'; // 👈 Add .js extension
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// The endpoint will be: POST /api/ai/ask
router.post('/ask', authMiddleware, askAssistant);

export default router;
