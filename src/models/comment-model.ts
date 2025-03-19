import mongoose, { Document, Schema } from "mongoose";
import { IComment } from "../types/model.types";



const commentSchema = new Schema<IComment>(
  {
    problem: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userProfession: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

commentSchema.index({ problem: 1 });
commentSchema.index({ user: 1 });

const Comment = mongoose.model<IComment>("Commnet", commentSchema);

export default Comment;
