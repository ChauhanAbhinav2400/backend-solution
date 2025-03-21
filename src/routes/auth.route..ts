import express from "express";
import {
  signup,
  verifyOTP,
  login,
  forgotPassword,
  verifyForgotPasswordOTP,
  changePassword,
  getProfile,
  updateProfile,
  resendOTP,
} from "../modules/auth/auth.controller";
import { authMiddleware } from "../middlewares/auth";


const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-password-otp", verifyForgotPasswordOTP);
router.post("/change-password", changePassword);
router.post("/resend-otp", resendOTP);

router.get("/profile", authMiddleware, getProfile);
router.put(
  "/profile",
  authMiddleware,
  updateProfile
);

export default router;
