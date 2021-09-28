export interface IApiResponse {
    statusCode?: number;
    meta?: IMeta;
    data?: any[] | any;
    errors?: string;
}

export interface IMeta {
    count: number;
    pageCount: number;
    totalCount: number;
    next: string;
    previous: string;
    self: string;
    first: string;
    last: string;
}
