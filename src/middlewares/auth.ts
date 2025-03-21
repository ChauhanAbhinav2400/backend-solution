import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res
        .status(401)
        .json({ success: false, message: "Access denied. No token provided." });
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET as string) as { id: string }
      req.userId = decoded.id;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(403).json({ success: false, message: "Token expired" });
        return;
      }
      res.status(401).json({ success: false, message: "Invalid token" });
      return;
    }
  } catch (error: any) {
    console.error("Auth middleware error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
