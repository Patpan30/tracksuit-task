import { Router } from "@oak/oak";
import * as InsightController from "../controllers/insight.controller.ts";

/**
 * Router for handling insight-related API endpoints.
 *
 * Routes:
 * - `GET /insights`: Retrieves a list of insights. Handled by `InsightController.list`.
 * - `GET /insights/:id`: Retrieves a specific insight by its ID. Handled by `InsightController.getById`.
 * - `POST /insights/create`: Creates a new insight. Handled by `InsightController.create`.
 * - `DELETE /insights/delete/:id`: Deletes an insight by its ID. Handled by `InsightController.deleteById`.
 *
 * @remarks
 * This router should be mounted in the main application to provide CRUD operations for insights.
 */
export const insightsRouter = new Router()
  .get("/insights", InsightController.list)
  .get("/insights/:id", InsightController.getById)
  .post("/insights/create", InsightController.create)
  .delete("/insights/delete/:id", InsightController.deleteById);
