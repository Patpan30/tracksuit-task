import listInsights from "../operations/list-insights.ts";
import lookupInsight from "../operations/lookup-insight.ts";
import createInsight from "../operations/create-insight.ts";
import deleteInsight from "../operations/delete-insight.ts";
import { InsightNotFoundError } from "../exceptions/insight.notfound.error.ts";
import { type RouteParams, type RouterContext, Status } from "@oak/oak";
import type { Database } from "@db/sqlite";
import { z } from "zod";
import { log } from "../deps.ts";

type State = { db: Database };
const CreatePayload = z.object({
  brand: z.number().int().nonnegative(),
  text: z.string().min(1),
});

/**
 * Sends a 400 Bad Request response with a specified error message.
 *
 * @template R - The route string type.
 * @template S - The state type.
 * @param ctx - The router context containing request and response objects.
 * @param message - The error message to include in the response body.
 */
function badRequest<
  R extends string,
  S extends State,
>(ctx: RouterContext<R, RouteParams<R>, S>, message: string) {
  ctx.response.status = Status.BadRequest;
  ctx.response.body = { error: message };
}

/**
 * Handles the retrieval of an insight by its ID from the database.
 *
 * @param ctx - The router context containing the request parameters, state, and response.
 *   - `params.id`: The ID of the insight to retrieve, expected as a string in the route.
 *   - `state.db`: The database instance used for lookup.
 *
 * @remarks
 * - Responds with HTTP 200 and the insight data if found.
 * - Responds with HTTP 400 if the ID is not a valid number.
 * - Responds with HTTP 404 if the insight is not found.
 * - Responds with HTTP 500 for other errors.
 *
 * @throws InsightNotFoundError - If the insight with the given ID does not exist.
 */
export function getById(
  ctx: RouterContext<"/insights/:id", { id: string }, State>,
): void {
  try {
    const id = Number(ctx.params.id);
    if (isNaN(id)) return badRequest(ctx, "id must be a number");
    const result = lookupInsight({ db: ctx.state.db, id: id });
    ctx.response.body = result;
    ctx.response.status = Status.OK;
  } catch (err) {
    log.error("Error looking up insight:", err);
    if (err instanceof InsightNotFoundError) {
      ctx.response.status = Status.NotFound;
      ctx.response.body = { error: err.message };
      return;
    }

    // Handle other errors
    ctx.response.status = Status.InternalServerError;
    ctx.response.body = { error: err };
  }
}

/**
 * Handles the HTTP request to list insights.
 *
 * Retrieves a list of insights from the database and sets the response body and status.
 * If an error occurs during retrieval, logs the error and responds with an internal server error status.
 *
 * @param ctx - The router context containing request, response, and state (including the database connection).
 */
export function list(
  ctx: RouterContext<"/insights", RouteParams<"/insights">, State>,
): void {
  try {
    const result = listInsights({ db: ctx.state.db });
    ctx.response.body = result;
    ctx.response.status = Status.OK;
  } catch (err) {
    log.error("Error listing insights:", err);
    ctx.response.status = Status.InternalServerError;
    ctx.response.body = { error: err };
  }
}

/**
 * Handles the creation of a new insight.
 *
 * This controller function parses the incoming request payload, validates it using the `CreatePayload` schema,
 * and creates a new insight in the database. On success, it sets the response status to `Created`.
 * If the payload is invalid, it responds with a bad request error. Any other errors result in an internal server error response.
 *
 * @param ctx - The router context containing the request, response, route parameters, and application state.
 * @returns A promise that resolves when the response has been sent.
 */
export async function create(
  ctx: RouterContext<
    "/insights/create",
    RouteParams<"/insights/create">,
    State
  >,
): Promise<void> {
  try {
    const payload = await ctx.request.body.json();
    const { brand, text } = CreatePayload.parse(payload);
    createInsight({ db: ctx.state.db, brand, text });
    ctx.response.status = Status.Created;
  } catch (err) {
    log.error("Error creating insight:", err);
    if (err instanceof z.ZodError) {
      badRequest(ctx, `Invalid payload: ${err.message}`);
      return;
    }
    ctx.response.status = Status.InternalServerError;
    ctx.response.body = { error: err };
  }
}

/**
 * Deletes an insight by its ID.
 *
 * @param ctx - The router context containing the request parameters and state.
 *   - `params.id`: The ID of the insight to delete (as a string, will be converted to number).
 *   - `state.db`: The database instance to use for deletion.
 * @returns A promise that resolves when the operation is complete.
 *
 * @remarks
 * - Responds with 204 No Content on successful deletion.
 * - Responds with 400 Bad Request if the ID is not a valid number.
 * - Responds with 404 Not Found if the insight does not exist.
 * - Responds with 500 Internal Server Error for other errors.
 */
export async function deleteById(
  ctx: RouterContext<"/insights/delete/:id", { id: string }, State>,
): Promise<void> {
  try {
    const id = Number(ctx.params.id);
    if (isNaN(id)) return badRequest(ctx, "id must be a number");
    deleteInsight({ db: ctx.state.db, id });
    ctx.response.status = Status.NoContent;
  } catch (err) {
    log.error("Error deleting insight:", err);
    if (err instanceof InsightNotFoundError) {
      ctx.response.status = Status.NotFound;
      ctx.response.body = { error: err.message };
      return;
    }

    ctx.response.status = Status.InternalServerError;
    ctx.response.body = { error: err };
  }
}
