import express from 'express';
import { generateChatResponse, getRecentChats, getChatById, saveChat } from '../controllers/chatController.js';
import { apiProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', generateChatResponse);

router.get('/history', apiProtect, getRecentChats);
router.post('/save', apiProtect, saveChat);
router.get('/:id', apiProtect, getChatById);

export default router;
