import Problem from "../models/problem-model";

export const canPostProblemToday = async (
    userId: string | any
  ): Promise<boolean> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const tommorow = new Date(today);
    tommorow.setDate(tommorow.getDate() + 1);
  
    const problemCount = await Problem.countDocuments({
      poster: userId,
      createdAt: { $gte: today, $lt: tommorow },
    });
    return problemCount === 0;
  };
  
  export const updateProblemScore = async (problemId: string): Promise<void> => {
    const problem = await Problem.findById(problemId);
    if (!problem) return;
  
    const likeFactor = Math.max(1, problem.likes - problem.dislikes);
    problem.score = likeFactor * problem.commentsCount;
    await problem.save();
  };