import express from 'express';
import { generateChatResponse, getRecentChats, getChatById, saveChat, deleteChat, getRecentHistory } from '../controllers/chatController.js';
import { apiProtect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', optionalAuth, generateChatResponse);

router.get('/history', apiProtect, getRecentChats);
router.get('/history/recent', apiProtect, getRecentHistory);
router.post('/save', apiProtect, saveChat);
router.get('/:id', apiProtect, getChatById);
router.delete('/:id', apiProtect, deleteChat);

export default router;

