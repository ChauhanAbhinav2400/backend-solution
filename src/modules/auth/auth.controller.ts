import { NextFunction, Request, Response } from "express";
import User from "../../models/user-model";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import { JWT_SECRET, EMAIL_CONFIG } from "../../config/config";
import { generateOTP } from "../../utils/generate-otp";
import { generateReferralCode } from "../../utils/generate-referral";
import { generateToken } from "../../utils/generate-token";
import { sendOtpEmail } from "../../utils/email";









export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fullName, email, password, field, profession, referedBy } =
      req.body;


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res
        .status(400)
        .json({ success: false, message: "Email already registered" });
      return;
    }


    const referralCode = await generateReferralCode();


    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

    const newUser = new User({
      fullName,
      email,
      password,
      field,
      profession,
      myreferalCode: referralCode,
      otp,
      otpExpiry,
      walletCoins: 0,
    });


    if (referedBy) {
      const referrer = await User.findOne({ myreferalCode: referedBy });
      if (referrer) {
        newUser.referedBy = referedBy;
        newUser.walletCoins = 5;
        newUser.coinsEarnedByReferal = 5;


        await User.findByIdAndUpdate(referrer._id, {
          $inc: {
            walletCoins: 10,
            referalCount: 1,
            coinsEarnedByReferal: 10,
          },
          $push: {
            myreferalList: {
              name: fullName,
              email: email,
              profession: profession,
              joinedDate: new Date().toISOString(),
            },
          },
        });
      }
    }


    await newUser.save();


    await sendOtpEmail(email, otp);

    res.status(200).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      data: {
        userId: newUser._id,
        referralCode: newUser.myreferalCode,
      },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Verify OTP controller
export const verifyOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, otp } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Check if OTP is valid
    if (user.otp !== otp) {
      res.status(400).json({ success: false, message: "Invalid OTP" });
      return;
    }

    // Check if OTP has expired
    if (user.otpExpiry && user.otpExpiry < new Date()) {
      res.status(400).json({ success: false, message: "OTP has expired" });
      return;
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate JWT token

    const userId: any = user._id;
    const token = generateToken(userId.toString());

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token,
    });
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Login controller
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Check if password is correct
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    // Check if user is verified
    if (!user.isVerified) {
      res.status(403).json({ success: false, message: "Email not verified" });
      return;
    }

    // Generate JWT token
    const userId: any = user._id;
    const token = generateToken(userId.toString());

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        referralCode: user.myreferalCode,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Forgot password controller
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

    // Update user with new OTP
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP to user's email
    await sendOtpEmail(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email for password reset",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Verify forgot password OTP controller
export const verifyForgotPasswordOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, otp } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Check if OTP is valid
    if (user.otp !== otp) {
      res.status(400).json({ success: false, message: "Invalid OTP" });
      return;
    }

    // Check if OTP has expired
    if (user.otpExpiry && user.otpExpiry < new Date()) {
      res.status(400).json({ success: false, message: "OTP has expired" });
      return;
    }

    // OTP is valid
    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: {
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error("Verify forgot password OTP error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Change password controller
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, newPassword } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Update password
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get profile controller
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId; // From auth middleware

    const user = await User.findById(userId).select(
      "-password -otp -otpExpiry"
    );
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error("Get profile error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Update profile controller
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId; // From auth middleware
    const { fullName, field, profession } = req.body;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Update user profile
    if (fullName) user.fullName = fullName;
    if (field) user.field = field;
    if (profession) user.profession = profession;

    // If profile picture is uploaded via multer, update it
    // if (req.file) {
    //   user.profilePicture = req.file.location; // S3 URL from multer
    // }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        field: user.field,
        profession: user.profession,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Resend OTP controller
export const resendOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

    // Update user with new OTP
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP to user's email
    await sendOtpEmail(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error: any) {
    console.error("Resend OTP error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
