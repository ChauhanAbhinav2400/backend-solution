import User from "../models/user-model";

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