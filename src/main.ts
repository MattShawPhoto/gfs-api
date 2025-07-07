import { createServer } from "node:http";
import { createServerAdapter } from "@whatwg-node/server";
import { AutoRouter, IRequest, json} from "itty-router";
import { ok } from "@major-tanya/fancy-status";
import { gfsParser } from "./csv-parser";
import { FakeDatabaseContext, IDatabaseContext } from "./store/fakeDbContext";
import { pagedApiResult } from "./types/api-result";
import { Consignment } from "./types/consignment";
import { take, skip } from "./utils";

// todo parse arguments

const dbContext = new FakeDatabaseContext();
const parser = gfsParser('./data/DPD_Test.csv', dbContext)

// Create router
const router = AutoRouter()

// create a handler
const forConsignmentNumber = (request: IRequest, dbContext: IDatabaseContext) => {

    const pageSize = 10;
    const pageNumber = 1;

    const consignments = dbContext.findConsignmentNumber(request.params.consignmentId);

    const result: pagedApiResult<Consignment> = {
        total: consignments.length,
        count: pageSize,
        pageNumber: pageNumber,
        pages: Math.ceil(consignments.length / pageSize),
        data : take(skip(consignments,pageNumber - 1), pageSize)
    };

    return json(result)
}

// add routes

router.get('/v1/consignments/:consignmentId', (request) => forConsignmentNumber(request, dbContext))

router.get('/v1/health', (request) => {
    return ok();
})

// Start server and listen for requests
const itty = createServerAdapter(router.fetch)
const httpServer = createServer(itty);
httpServer.listen(3001);
