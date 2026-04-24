import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { apiProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', apiProtect, getDashboardStats);

export default router;
