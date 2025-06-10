import type { HasDBClient } from "../shared.ts";
import { insertStatement } from "$tables/insights.ts";
import { log } from "../deps.ts";

type Input = HasDBClient & {
  brand: number;
  text: string;
};

/**
 * Creates a new insight entry in the database for the specified brand with the provided text.
 *
 * @param db - The database instance used to execute the insert operation.
 * @param brand - The brand identifier for which the insight is being created.
 * @param text - The content of the insight to be stored.
 * @throws Will throw an error if the insight creation fails.
 */
export default ({ db, brand, text }: Input): void => {
  log.info(`Creating insight for brand=${brand} with text="${text}"`);
  const result = db.prepare(
    insertStatement({
      brand,
      createdAt: new Date().toISOString(),
      text,
    }),
  ).run();
  if (result === 0) {
    throw new Error("Failed to create insight");
  }
  log.info("Insight created successfully");
};
