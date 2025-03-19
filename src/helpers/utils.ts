import Problem from "../models/problem-model";
import User from "../models/user-model";

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateReferralCode = async (): Promise<string> => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let referralCode = "";
  for (let i = 0; i < 6; i++) {
    referralCode += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  const existingUser = await User.findOne({ myreferalCode: referralCode });
  if (existingUser) {
    return generateReferralCode();
  }
  return referralCode;
};

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
