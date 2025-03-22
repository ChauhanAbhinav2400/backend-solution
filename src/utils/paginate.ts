
import { Model, Document } from "mongoose";
import { PaginatedResult, PaginationOptions } from "../types/pagination.types";
export async function paginate<T extends Document, SortFieldType = any>(
    model: Model<T>,
    options: PaginationOptions<SortFieldType> = {}
): Promise<PaginatedResult<T, SortFieldType>> {
    const {
        limit = 10,
        filter = {},
        sortField = "createdAt",
        sortOrder = -1,
        cursor,
        select,
        populate
    } = options;


    const queryFilter: Record<string, any> = { ...filter };


    if (cursor !== undefined && cursor !== null) {
        queryFilter[sortField] = sortOrder === 1 ? { $gt: cursor } : { $lt: cursor };
    }


    let query = model.find(queryFilter)
        .limit(limit + 1)
        .lean();


    if (select) {
        query = query.select(select);
    }


    if (populate) {
        query = query.populate(populate as any);
    }


    const data = await query.exec() as unknown as T[];


    const hasNextPage = data.length > limit;
    let nextCursor: SortFieldType | null = null;

    if (hasNextPage) {

        const lastItem = data.pop() as any;
        nextCursor = lastItem[sortField] as SortFieldType;
    }

    return {
        data,
        nextCursor,
        limit,
        hasNextPage,
    };
}