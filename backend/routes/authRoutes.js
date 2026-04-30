import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  completeProfile,
  getProfile,
  deleteProfile
} from "../controllers/authController.js";

import { apiProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", apiProtect, getMe);

router.post("/complete-profile", apiProtect, completeProfile);
router.get("/profile", apiProtect, getProfile);
router.delete("/delete-profile", apiProtect, deleteProfile);

export default router;