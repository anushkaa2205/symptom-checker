import express from 'express';
import {registerUser, loginUser, getMe, logoutUser} from "../controllers/authController.js";
import { apiProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", apiProtect, getMe);

export default router;