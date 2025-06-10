import { Router } from "@oak/oak";
import { Status } from "jsr:@oak/commons@1/status";

/**
 * Router instance that defines the health check endpoint.
 *
 * This router exposes a GET endpoint at `/_health` which responds with a 200 status and "OK" body.
 * It can be used by monitoring systems or load balancers to verify that the server is running.
 *
 * @remarks
 * Uses the Oak framework's Router for route definition.
 *
 * @example
 * // Example usage in an Oak application:
 * app.use(healthRouter.routes());
 * app.use(healthRouter.allowedMethods());
 */
export const healthRouter = new Router()
  .get("/_health", (ctx) => {
    ctx.response.status = Status.OK;
    ctx.response.body = "OK";
  });
