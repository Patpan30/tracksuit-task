import type { HasDBClient } from "../shared.ts";
import { InsightNotFoundError } from "../exceptions/insight.notfound.error.ts";
import { deleteStatement } from "$tables/insights.ts";
import { log } from "../deps.ts";

type Input = HasDBClient & {
  id: number;
};

/**
 * Deletes an insight from the database by its ID.
 *
 * @param db - The database client used to execute the delete operation.
 * @param id - The unique identifier of the insight to delete.
 * @throws {InsightNotFoundError} If no insight with the specified ID is found.
 *
 * @example
 * ```typescript
 * deleteInsight({ db, id: 123 });
 * ```
 */
export default ({ db, id }: Input): void => {
  log.info(`Deleting insight with id=${id}`);
  const result = db.prepare(deleteStatement(id)).run();
  if (result === 0) {
    throw new InsightNotFoundError(`Insight with id ${id} not found`);
  }
  log.info("Insight deleted successfully");
};
