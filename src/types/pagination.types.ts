export interface PaginationOptions<SortFieldType = any> {
    limit?: number;
    filter?: Record<string, any>;
    select?: string | Record<string, number>;
    populate?: string | Record<string, any> | Array<any>;
    sortField?: string;
    sortOrder?: 1 | -1;
    cursor?: SortFieldType;
  }
  
  export interface PaginatedResult<T, SortFieldType = any> {
    data: T[];
    nextCursor: SortFieldType | null;
    limit: number;
    hasNextPage: boolean;
  }