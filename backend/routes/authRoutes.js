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

import { apiProtect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", apiProtect, getMe);

// Lightweight login check for the navbar and chat greeting. Always answers 200 so
// logged-out visitors don't get a 401 error in their browser console.
router.get("/status", optionalAuth, (req, res) => {
  res.set("Cache-Control", "no-store");
  if (req.user) {
    return res.json({ loggedIn: true, name: req.user.Fname || req.user.name || "User" });
  }
  res.json({ loggedIn: false });
});

router.post("/complete-profile", apiProtect, completeProfile);
router.get("/profile", apiProtect, getProfile);
router.delete("/delete-profile", apiProtect, deleteProfile);

export default router;