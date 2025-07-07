import { IRequest, json } from "itty-router";
import { IDatabaseContext } from "../store/fakeDbContext";
import { Consignment } from "../types/consignment";
import { pagedApiResult } from "../types/api-result";
import { skip, take } from "../utils";
import { badRequest } from "@major-tanya/fancy-status";

export const forConsignmentNumber = (request: IRequest, dbContext: IDatabaseContext) => {

    const consignmentNumber = request.params.consignmentId;

    if(consignmentNumber.length < 4) {
        return badRequest();
    }

    const consignments = dbContext.findConsignmentNumber(request.params.consignmentId);

    let pageNumber: number = parseInt(request.query['pageNumber'] as string) || 1;
    let pageSize: number = parseInt(request.query['pageSize'] as string) || 10

    const result: pagedApiResult<Consignment> = {
        total: consignments.length,
        count: pageSize,
        pageNumber: pageNumber,
        pages: Math.ceil(consignments.length / pageSize),
        data : take(skip(consignments, pageNumber - 1), pageSize)
    };

    return json(result)
}
