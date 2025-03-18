import mongoose, { Document, Schema } from "mongoose";

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

const problemSchema = new Schema<IProblem>(
  {
    title: {
      type: String,
      required: [true, "Title is Required"],
      trim: true,
    },

    field: {
      type: String,
      required: [true, "Field is required"],
      enum: [
        "Healthcare",
        "Education",
        "Technology",
        "Finance",
        "Business",
        "Environment",
        "Transportation",
        "Other",
      ],
    },
    detailDescription: {
      type: String,
      required: [true, "Detail description is required"],
      trim: true,
    },
    poster: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    posterName: {
      type: String,
      required: true,
    },
    posterProfession: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

problemSchema.index({ field: 1 });
problemSchema.index({ poster: 1 });
problemSchema.index({ title: "text" });
problemSchema.index({ score: -1 });

const Problem = mongoose.model<IProblem>("Problem", problemSchema);

export default Problem;
