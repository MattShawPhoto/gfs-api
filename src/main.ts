import { createServer } from "node:http";
import { createServerAdapter } from "@whatwg-node/server";
import { AutoRouter} from "itty-router";
import { ok } from "@major-tanya/fancy-status";

// Create router
const router = AutoRouter()

// add routes
router.get('/v1/health', (request) => {
    return ok();
})

router.get('/v1/dave', (request) => {
    console.log(`foo`)
    return ok();
})

// Start server and listen for requests
const itty = createServerAdapter(router.fetch)
const httpServer = createServer(itty);
httpServer.listen(3001);
