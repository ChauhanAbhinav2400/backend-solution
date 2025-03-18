import { NextFunction, Request, Response } from "express";
import Problem from "../models/problem-model";
import User from "../models/user-model";
import Comment from "../models/comment-model";
import { canPostProblemToday, updateProblemScore } from "../helpers/utils";
import mongoose from "mongoose";

export const createProblem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;
    const { title, field, detailDescription } = req.body;

    const canPost = await canPostProblemToday(userId);
    if (!canPost) {
      res.status(400).json({
        success: false,
        message: "You can only post One Problem per Day",
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }
    const newProblem = new Problem({
      title,
      field,
      detailDescription,
      poster: userId,
      posterName: user.fullName,
      posterProfession: user.profession,
    });

    await newProblem.save();

    user.walletCoins += 1;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Problem created successfully",
      data: newProblem,
    });
  } catch (error) {
    console.error("Create problem error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error,
    });
  }
};

export const getAllProblems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const field = req.query.field as string;
    const search = req.query.search as string;
    const sortBy = (req.query.sortBy as string) || "score";

    // Build filter object
    const filter: any = {};

    if (field && field !== "all") {
      filter.field = field;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Determine sort order
    let sort: any = {};
    switch (sortBy) {
      case "latest":
        sort = { createdAt: -1 };
        break;
      case "oldest":
        sort = { createdAt: 1 };
        break;
      case "mostLiked":
        sort = { likes: -1 };
        break;
      case "mostCommented":
        sort = { commentsCount: -1 };
        break;
      default:
        sort = { score: -1 };
    }

    // Get total count for pagination
    const total = await Problem.countDocuments(filter);

    // Find problems with filters, sort, and pagination
    const problems = await Problem.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Transform problems to include isLiked and isDisliked for the user
    const userId = req.userId;
    let transformedProblems: any = problems;

    if (userId) {
      transformedProblems = problems.map((problem) => {
        const doc = problem.toObject();
        return {
          ...doc,
          isLiked: problem.likedBy.some((id) => id.toString() === userId),
          isDisliked: problem.dislikedBy.some((id) => id.toString() === userId),
        };
      });
    }

    res.status(200).json({
      success: true,
      data: transformedProblems,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Get all problems error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get problems by field
export const getProblemsByField = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const field = req.params.field;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Problem.countDocuments({ field });

    // Find problems with filters, sort, and pagination
    const problems = await Problem.find({ field })
      .sort({ score: -1 })
      .skip(skip)
      .limit(limit);

    // Transform problems to include isLiked and isDisliked for the user
    const userId = req.userId;
    let transformedProblems: any = problems;

    if (userId) {
      transformedProblems = problems.map((problem) => {
        const doc = problem.toObject();
        return {
          ...doc,
          isLiked: problem.likedBy.some((id) => id.toString() === userId),
          isDisliked: problem.dislikedBy.some((id) => id.toString() === userId),
        };
      });
    }

    res.status(200).json({
      success: true,
      data: transformedProblems,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Get problems by field error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Search problems
export const searchProblems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const search = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!search) {
      res.status(400).json({
        success: false,
        message: "Search query is required",
      });
      return;
    }

    // Get total count for pagination
    const total = await Problem.countDocuments({
      $text: { $search: search },
    });

    // Find problems with search text
    const problems = await Problem.find({
      $text: { $search: search },
    })
      .sort({ score: -1 })
      .skip(skip)
      .limit(limit);

    // Transform problems to include isLiked and isDisliked for the user
    const userId = req.userId;
    let transformedProblems: any = problems;

    if (userId) {
      transformedProblems = problems.map((problem) => {
        const doc = problem.toObject();
        return {
          ...doc,
          isLiked: problem.likedBy.some((id) => id.toString() === userId),
          isDisliked: problem.dislikedBy.some((id) => id.toString() === userId),
        };
      });
    }

    res.status(200).json({
      success: true,
      data: transformedProblems,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Search problems error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get problem by ID
export const getProblemById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const problemId = req.params.id;

    // Find problem by ID
    const problem = await Problem.findById(problemId);

    if (!problem) {
      res.status(404).json({
        success: false,
        message: "Problem not found",
      });
      return;
    }

    // Transform problem to include isLiked and isDisliked for the user
    const userId = req.userId;
    let transformedProblem: any = problem;

    if (userId) {
      const doc = problem.toObject();
      transformedProblem = {
        ...doc,
        isLiked: problem.likedBy.some((id) => id.toString() === userId),
        isDisliked: problem.dislikedBy.some((id) => id.toString() === userId),
      };
    }

    // Get recent comments for the problem
    const comments = await Comment.find({ problem: problemId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        problem: transformedProblem,
        comments,
      },
    });
  } catch (error: any) {
    console.error("Get problem by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get problems by user ID
export const getProblemsByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Problem.countDocuments({ poster: userId });

    // Find problems by user ID
    const problems = await Problem.find({ poster: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Transform problems to include isLiked and isDisliked for the user
    const currentUserId = req.userId;
    let transformedProblems: any = problems;

    if (currentUserId) {
      transformedProblems = problems.map((problem) => {
        const doc = problem.toObject();
        return {
          ...doc,
          isLiked: problem.likedBy.some(
            (id) => id.toString() === currentUserId
          ),
          isDisliked: problem.dislikedBy.some(
            (id) => id.toString() === currentUserId
          ),
        };
      });
    }

    res.status(200).json({
      success: true,
      data: transformedProblems,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Get problems by user ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update problem
export const updateProblem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;
    const problemId = req.params.id;
    const { title, field, detailDescription } = req.body;

    // Find problem by ID
    const problem = await Problem.findById(problemId);

    if (!problem) {
      res.status(404).json({
        success: false,
        message: "Problem not found",
      });
      return;
    }

    // Check if user is the poster
    if (problem.poster.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: "You can only update your own problems",
      });
      return;
    }

    // Update problem
    if (title) problem.title = title;
    if (field) problem.field = field;
    if (detailDescription) problem.detailDescription = detailDescription;

    await problem.save();

    res.status(200).json({
      success: true,
      message: "Problem updated successfully",
      data: problem,
    });
  } catch (error: any) {
    console.error("Update problem error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete problem
export const deleteProblem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;
    const problemId = req.params.id;

    // Find problem by ID
    const problem = await Problem.findById(problemId);

    if (!problem) {
      res.status(404).json({
        success: false,
        message: "Problem not found",
      });
      return;
    }

    // Check if user is the poster
    if (problem.poster.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: "You can only delete your own problems",
      });
      return;
    }

    // Delete all comments for this problem
    await Comment.deleteMany({ problem: problemId });

    // Delete the problem
    await Problem.findByIdAndDelete(problemId);

    res.status(200).json({
      success: true,
      message: "Problem deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete problem error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Like a problem
export const likeProblem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;
    const problemId = req.params.id;

    // Find problem by ID
    const problem = await Problem.findById(problemId);

    if (!problem) {
      res.status(404).json({
        success: false,
        message: "Problem not found",
      });
      return;
    }

    // Check if user has already liked or disliked the problem
    const alreadyLiked = problem.likedBy.includes(
      new mongoose.Types.ObjectId(userId)
    );
    const alreadyDisliked = problem.dislikedBy.includes(
      new mongoose.Types.ObjectId(userId)
    );

    // Transaction to handle likes/dislikes
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (alreadyLiked) {
        // User is removing like
        problem.likes -= 1;
        problem.likedBy = problem.likedBy.filter(
          (id) => id.toString() !== userId
        );
      } else {
        // User is adding like
        problem.likes += 1;
        problem.likedBy.push(new mongoose.Types.ObjectId(userId));

        // If user had disliked before, remove the dislike
        if (alreadyDisliked) {
          problem.dislikes -= 1;
          problem.dislikedBy = problem.dislikedBy.filter(
            (id) => id.toString() !== userId
          );
        }

        // Add coins to user wallet if it's a new like
        const user = await User.findById(userId);
        if (user) {
          user.walletCoins += 0.2;
          user.coinsEarnedByLikes += 0.2;
          await user.save({ session });
        }
      }

      // Update problem score
      const likeFactor = Math.max(1, problem.likes - problem.dislikes);
      problem.score = likeFactor * problem.commentsCount;

      await problem.save({ session });
      await session.commitTransaction();

      res.status(200).json({
        success: true,
        message: alreadyLiked ? "Like removed" : "Problem liked",
        data: {
          likes: problem.likes,
          dislikes: problem.dislikes,
          isLiked: !alreadyLiked,
          isDisliked: false,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error: any) {
    console.error("Like problem error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Dislike a problem
export const dislikeProblem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;
    const problemId = req.params.id;

    // Find problem by ID
    const problem = await Problem.findById(problemId);

    if (!problem) {
      res.status(404).json({
        success: false,
        message: "Problem not found",
      });
      return;
    }

    // Check if user has already liked or disliked the problem
    const alreadyLiked = problem.likedBy.includes(
      new mongoose.Types.ObjectId(userId)
    );
    const alreadyDisliked = problem.dislikedBy.includes(
      new mongoose.Types.ObjectId(userId)
    );

    // Transaction to handle likes/dislikes
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (alreadyDisliked) {
        // User is removing dislike
        problem.dislikes -= 1;
        problem.dislikedBy = problem.dislikedBy.filter(
          (id) => id.toString() !== userId
        );
      } else {
        // User is adding dislike
        problem.dislikes += 1;
        problem.dislikedBy.push(new mongoose.Types.ObjectId(userId));

        // If user had liked before, remove the like
        if (alreadyLiked) {
          problem.likes -= 1;
          problem.likedBy = problem.likedBy.filter(
            (id) => id.toString() !== userId
          );
        }
      }

      // Update problem score
      const likeFactor = Math.max(1, problem.likes - problem.dislikes);
      problem.score = likeFactor * problem.commentsCount;

      await problem.save({ session });
      await session.commitTransaction();

      res.status(200).json({
        success: true,
        message: alreadyDisliked ? "Dislike removed" : "Problem disliked",
        data: {
          likes: problem.likes,
          dislikes: problem.dislikes,
          isLiked: false,
          isDisliked: !alreadyDisliked,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error: any) {
    console.error("Dislike problem error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Comment on a problem
export const commentOnProblem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;
    const problemId = req.params.id;
    const { text } = req.body;

    // Find problem by ID
    const problem = await Problem.findById(problemId);

    if (!problem) {
      res.status(404).json({
        success: false,
        message: "Problem not found",
      });
      return;
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Transaction to create comment and update problem
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create new comment
      const newComment = new Comment({
        problem: problemId,
        user: userId,
        userName: user.fullName,
        userProfession: user.profession,
        text,
      });

      await newComment.save({ session });

      // Increase comments count and update score
      problem.commentsCount += 1;
      const likeFactor = Math.max(1, problem.likes - problem.dislikes);
      problem.score = likeFactor * problem.commentsCount;

      await problem.save({ session });

      // Add coins to user wallet
      user.walletCoins += 0.1;
      user.coinsEarnedByComments += 0.1;
      await user.save({ session });

      await session.commitTransaction();

      res.status(201).json({
        success: true,
        message: "Comment added successfully",
        data: newComment,
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error: any) {
    console.error("Comment on problem error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all comments for a problem with pagination
export const getProblemComments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const problemId = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Check if problem exists
    const problemExists = await Problem.exists({ _id: problemId });
    if (!problemExists) {
      res.status(404).json({
        success: false,
        message: "Problem not found",
      });
      return;
    }

    // Get total count for pagination
    const total = await Comment.countDocuments({ problem: problemId });

    // Find comments for the problem
    const comments = await Comment.find({ problem: problemId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Get problem comments error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get top problems (highest score)
export const getTopProblems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    // Find top problems by score
    const topProblems = await Problem.find().sort({ score: -1 }).limit(limit);

    // Transform problems to include isLiked and isDisliked for the user
    const userId = req.userId;
    let transformedProblems: any = topProblems;

    if (userId) {
      transformedProblems = topProblems.map((problem) => {
        const doc = problem.toObject();
        return {
          ...doc,
          isLiked: problem.likedBy.some((id) => id.toString() === userId),
          isDisliked: problem.dislikedBy.some((id) => id.toString() === userId),
        };
      });
    }

    res.status(200).json({
      success: true,
      data: transformedProblems,
    });
  } catch (error: any) {
    console.error("Get top problems error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
