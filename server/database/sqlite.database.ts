import * as path from "@std/path";
import { Database } from "@db/sqlite";
import { createTable } from "$tables/insights.ts";
import { log } from "../deps.ts";

const dbFilePath = path.resolve("tmp", "db.sqlite3");

let dbInstance: Database | null = null;

let dbInitLock: Promise<void> | null = null;

/**
 * Retrieves the singleton SQLite database instance, initializing it if necessary.
 *
 * Ensures that the database is only initialized once, using a lock to prevent race conditions
 * during concurrent calls. If the database file or its parent directory does not exist, they
 * will be created. The database schema is initialized by executing the `createTable` statement.
 *
 * @returns {Promise<Database>} A promise that resolves to the initialized SQLite database instance.
 */
export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  // Use a lock to prevent race conditions during initialization
  if (!dbInitLock) {
    dbInitLock = (async () => {
      log.info(`Opening SQLite database at ${dbFilePath}`);
      await Deno.mkdir(path.dirname(dbFilePath), { recursive: true });
      dbInstance = new Database(dbFilePath);
      dbInstance.exec(createTable);
    })();
  }
  await dbInitLock;
  return dbInstance!;
}
