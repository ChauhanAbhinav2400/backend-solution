import mongoose, { Document } from "mongoose";

export interface IProblem extends Document {
  title: string;
  field: string;
  detailDescription: string;
  poster: mongoose.Types.ObjectId;
  posterName: string;
  posterProfession: string;
  likes: number;
  dislikes: number;
  score: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
  likedBy: mongoose.Types.ObjectId[];
  dislikedBy: mongoose.Types.ObjectId[];
}


export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  field: string;
  profession: string;
  walletCoins: number;
  myreferalCode: string;
  referedBy?: string;
  referalCount: number;
  coinsEarnedByLikes: number;
  coinsEarnedByReferal: number;
  coinsEarnedByComments: number;
  myreferalList: Array<{ name: string; profession: string }>;
  isVerified: boolean;
  otp?: string;
  otpExpiry?: Date;
  profilePicture?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}


export interface IComment extends Document {
  problem: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  userName: string;
  userProfession: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface IChallenge extends Document {
  title: string;
  description: string;
  category: string;
  user: mongoose.Types.ObjectId;
  price: number;
  createdAt: Date;
  updatedAt: Date;

}