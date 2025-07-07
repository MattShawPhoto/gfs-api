export type baseApiResult = {}

export type pagedApiResult<t> = {
    total: number
    count: number,
    pages: number,
    pageNumber: number
    data: Array<t>
} & baseApiResult
