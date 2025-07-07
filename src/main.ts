import { createServer } from "node:http";
import { createServerAdapter } from "@whatwg-node/server";
import { AutoRouter, IRequest} from "itty-router";
import { notFound, ok } from "@major-tanya/fancy-status";
import { gfsParser } from "./csv-parser";
import { FakeDatabaseContext } from "./store/fakeDbContext";
import { forConsignmentNumber } from "./handlers/for-consignment-number";
import { forDeliveryAddress } from "./handlers/for-delivery-address";
import { parseArgs } from "node:util";
import { exit } from "node:process";
import { ApiOptions } from "./types/api-options";
import * as fs from "node:fs"
import { AddressInfo } from "node:net";

// Parse arguments
let options: ApiOptions = {
    filePath:'',
    port: 3001
};

const { values } = parseArgs({
  options: {
    filePath: { type: 'string', short: 'f' },
    port: { type: 'string', short: 'p' },
  },
  allowPositionals: false,
});

if(!values.filePath) {
    console.error(`No file path specified, exiting.`)
    exit();
}

options.filePath = values.filePath

if(!fs.existsSync(values.filePath)) {
    console.error(`Couldn't find ${values.filePath}, exiting.`)
    exit();
}

if(!values.port) {
    console.error(`No port specified, using ${options.port}.`)
} else {
    options.port = parseInt(values.port);
}

const dbContext = new FakeDatabaseContext();

// Parse input file into db context
gfsParser('./data/DPD_Test.csv', dbContext)

// Create router
const router = AutoRouter()

// add routes

router.get('/v1/consignments/:consignmentId', (request: IRequest) => forConsignmentNumber(request, dbContext))

router.get('/v1/consignments?', (request: IRequest) => {

    if(request.query['address']) {
        return forDeliveryAddress(request, dbContext)
    }

    // todom, check other qs params and return 400 if params don't match allowed ones.
})

router.get('/v1/health', () => {
    return ok();
})

router.all('*', (request: IRequest) => notFound(`${request.url} not found at GFS`))

// Start server and listen for requests
const itty = createServerAdapter(router.fetch)
const httpServer = createServer(itty);
httpServer.listen(options.port);

const address = httpServer.address() as AddressInfo;
console.log(`gfs-api is listening on localhost at port ${address.port}`)
