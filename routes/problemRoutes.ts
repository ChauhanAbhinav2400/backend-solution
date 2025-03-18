import express from "express";
import {
  createProblem,
  getAllProblems,
  getProblemsByField,
  searchProblems,
  getProblemById,
  getProblemsByUserId,
  updateProblem,
  deleteProblem,
  likeProblem,
  dislikeProblem,
  commentOnProblem,
  getProblemComments,
  getTopProblems,
} from "../controllers/problemController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/all-problems", authMiddleware, getAllProblems);
router.get("/field/:field", authMiddleware, getProblemsByField);
router.get("/problem/search", authMiddleware, searchProblems);
router.get("/top-problems", authMiddleware, getTopProblems);
router.get("/problem/:id", authMiddleware, getProblemById);
router.get("/problem/:userId", authMiddleware, getProblemsByUserId);
router.get("/problem/:id/comments", getProblemComments);

// Protected routes (require authentication)
router.post("/add-problem", authMiddleware, createProblem);
router.put("/problem/:id", authMiddleware, updateProblem);
router.delete("/problem/:id", authMiddleware, deleteProblem);
router.post("/problem/:id/like", authMiddleware, likeProblem);
router.post("/problem/:id/dislike", authMiddleware, dislikeProblem);
router.post("/problem/:id/comment", authMiddleware, commentOnProblem);

export default router;
