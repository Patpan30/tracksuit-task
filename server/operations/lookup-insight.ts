import type { Insight } from "$models/insight.ts";
import type { HasDBClient } from "../shared.ts";
import type * as insightsTable from "$tables/insights.ts";
import { InsightNotFoundError } from "../exceptions/insight.notfound.error.ts";
import { log } from "../deps.ts";

type Input = HasDBClient & {
  id: number;
};

/**
 * Retrieves an insight by its ID from the database.
 *
 * @param input - An object containing the database client and the ID of the insight to look up.
 * @returns The retrieved `Insight` object if found.
 * @throws {InsightNotFoundError} If no insight with the specified ID is found.
 */
export default (input: Input): Insight | undefined => {
  log.info(`Looking up insight for id=${input.id}`);

  const [row] = input.db
    .sql<
    insightsTable.Row
  >`SELECT * FROM insights WHERE id = ${input.id} LIMIT 1`;

  if (!row) {
    throw new InsightNotFoundError(`Insight with id ${input.id} not found`);
  }

  const result = { ...row, createdAt: new Date(row.createdAt) };
  log.info("Insight retrieved:", result);
  return result;
};
