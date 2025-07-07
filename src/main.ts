import { createServer } from "node:http";
import { createServerAdapter } from "@whatwg-node/server";
import { AutoRouter} from "itty-router";
import { ok } from "@major-tanya/fancy-status";
import { gfsParser } from "./csv-parser";
import { FakeDatabaseContext } from "./store/fakeDbContext";
import { forConsignmentNumber } from "./handlers/for-consignment-number";
import { forDeliveryAddress } from "./handlers/for-delivery-address";

// todo parse arguments

const dbContext = new FakeDatabaseContext();

// Parse input file into db context
gfsParser('./data/DPD_Test.csv', dbContext)

// Create router
const router = AutoRouter()

// add routes

router.get('/v1/consignments/:consignmentId', (request) => forConsignmentNumber(request, dbContext))

router.get('/v1/consignments?', (request) => {

    if(request.query['address']) {
        return forDeliveryAddress(request, dbContext)
    }

    // todom, check other qs params and return 400 if params don't match allowed ones.
})

router.get('/v1/health', (request) => {
    return ok();
})

// Start server and listen for requests
const itty = createServerAdapter(router.fetch)
const httpServer = createServer(itty);
httpServer.listen(3001);
