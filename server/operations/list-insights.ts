import type { Insight } from "$models/insight.ts";
import type { HasDBClient } from "../shared.ts";
import type * as insightsTable from "$tables/insights.ts";
import { log } from "../deps.ts";

type Input = HasDBClient;

/**
 * Retrieves a list of all insights from the database.
 *
 * @param input - An object containing the database client.
 * @returns An array of `Insight` objects with their `createdAt` fields converted to `Date` instances.
 *
 * @remarks
 * This function queries the `insights` table and maps each row to an `Insight` object,
 * ensuring that the `createdAt` property is a JavaScript `Date` object.
 * Logs are produced before and after the retrieval for debugging purposes.
 */
export default (input: Input): Insight[] => {
  log.info("Listing insights");

  const rows = input.db.sql<insightsTable.Row>`SELECT * FROM insights`;

  const result: Insight[] = rows.map((row) => ({
    ...row,
    createdAt: new Date(row.createdAt),
  }));

  log.info("Retrieved insights successfully: ", result);
  return result;
};
