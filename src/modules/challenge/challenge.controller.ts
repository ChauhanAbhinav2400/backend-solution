import { Request, Response, NextFunction } from "express";
import Challenge from "../../models/challenge.model";
import { sendResponse } from "res-express";
import { paginate } from "../../utils/paginate";
import { PaginationOptions } from "../../types/pagination.types";



export const createChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, description, category, price } = req.body;
        const challenge = new Challenge({ title, description, category, user: req.userId, price });
        await challenge.save();
        return sendResponse(res, 201, { success: true, data: challenge });
    } catch (error) {
        next(error);
    }
};

//TODO:This will change also getCHallenges needs to be done
export const getChallengeById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const challenge = await Challenge.findById(id).populate("user");
        if (!challenge) {
            return sendResponse(res, 404, { error: "Challenge not found" });
        }
        return sendResponse(res, 200, { success: true, data: challenge });
    } catch (error) {
        next(error);
    }
};


export const updateChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updatedChallenge = await Challenge.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedChallenge) {
            return sendResponse(res, 404, { error: "Challenge not found" });
        }
        return sendResponse(res, 200, { success: true, data: updatedChallenge });
    } catch (error) {
        next(error);
    }
};


export const deleteChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const deletedChallenge = await Challenge.findByIdAndDelete(id);
        if (!deletedChallenge) {
            return sendResponse(res, 404, { error: "Challenge not found" });
        }
        return sendResponse(res, 200, { success: true, message: "Challenge deleted successfully" });
    } catch (error) {
        next(error);
    }
};

export const myChallenges = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { limit, cursor } = req.query;
        const paginationOptions: PaginationOptions<Date> = {
            limit: Number(limit) || 10,
            filter: { user: req.userId },
            sortField: "createdAt",
            sortOrder: -1
        };

        if (cursor) {
            paginationOptions.cursor = new Date(cursor as string);
        }


        const result = await paginate(Challenge, paginationOptions);

        return sendResponse(res, 200, {
            success: true,
            message: "My challenges",
            data: result
        });
    } catch (error) {
        next(error);
    }
};
