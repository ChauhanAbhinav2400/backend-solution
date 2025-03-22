import mongoose, { Schema } from "mongoose";
import { IChallenge } from "../types/model.types";


const challengeSchema = new Schema<IChallenge>(
    {
        title: {
            type: String,
            trim: true,
        },

        description: {
            type: String,
            trim: true

        },
        category: {
            type: String,

        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",

        },
        price: {
            type: Number
        }

    },
    { timestamps: true }
);



const Challenge = mongoose.model<IChallenge>("Challenge", challengeSchema);

export default Challenge;
