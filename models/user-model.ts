import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

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

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "FUllName is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    field: {
      type: String,
      required: [true, "Field is required"],
      trim: true,
    },
    profession: {
      type: String,
      required: [true, "Profession is required"],
      trim: true,
    },
    walletCoins: {
      type: Number,
      default: 0,
    },
    myreferalCode: {
      type: String,
      unique: true,
    },
    referedBy: {
      type: String,
      default: null,
    },
    referalCount: {
      type: Number,
      default: 0,
    },
    coinsEarnedByLikes: {
      type: Number,
      default: 0,
    },
    coinsEarnedByReferal: {
      type: Number,
      default: 0,
    },
    coinsEarnedByComments: {
      type: Number,
      default: 0,
    },
    myreferalList: [
      {
        name: String,
        profession: String,
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    profilePicture: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
