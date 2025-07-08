import { IRequest, json } from "itty-router";
import { IDatabaseContext } from "../store/fakeDbContext";
import { Consignment } from "../types/consignment";
import { pagedApiResult } from "../types/api-result";
import { skip, take } from "../utils";
import { badRequest } from "@major-tanya/fancy-status";

export const forDeliveryAddress = (request: IRequest, dbContext: IDatabaseContext) => {
    const address = request.query['address']

    // reject requests that have a search string less than 4 chars
    if(address === undefined || address.length < 4) {
        return badRequest();
    }

    const consignments = dbContext.findAddress(address.toString());

    let pageNumber: number = parseInt(request.query['pageNumber'] as string) || 1;
    let pageSize: number = parseInt(request.query['pageSize'] as string) || 10

    const result: pagedApiResult<Consignment> = {
        total: consignments.length,
        count: pageSize,
        pageNumber: pageNumber,
        pages: Math.ceil(consignments.length / pageSize),
        data : take(skip(consignments,pageNumber - 1), pageSize)
    };

    return json(result)
}
