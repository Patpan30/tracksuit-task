// delete-insight.test.ts
import { expect } from "jsr:@std/expect";
import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import { withDB } from "../testing.ts"; // your helper
import deleteInsight from "./delete-insight.ts"; // function under test
import { InsightNotFoundError } from "../exceptions/insight.notfound.error.ts";
import type { Row } from "$tables/insights.ts";

/* ------------------------------------------------------------------ */
/* 1. Successful delete                                               */
/* ------------------------------------------------------------------ */
describe("deleting an existing insight", () => {
  withDB((fixture) => {
    const seed: Row = {
      id: 1,
      brand: 0,
      createdAt: new Date().toISOString(),
      text: "to be deleted",
    };

    let rowsAfterDelete: Row[];

    beforeAll(() => {
      // seed one record
      fixture.insights.insert([
        { ...seed },
      ]);

      expect(fixture.insights.selectAll()[0]).toMatchObject(seed);
      // perform deletion
      deleteInsight({ ...fixture, id: seed.id });

      // query DB for verification
      rowsAfterDelete = fixture.insights.selectAll();
    });

    it("removes the record from the DB", () => {
      expect(rowsAfterDelete).toEqual([]); // DB should be empty
    });
  });
});

/* ------------------------------------------------------------------ */
/* 2. Delete a non-existent insight  → should throw                   */
/* ------------------------------------------------------------------ */
describe("deleting a non-existent insight", () => {
  withDB((fixture) => {
    let captured: unknown;

    beforeAll(() => {
      try {
        deleteInsight({ ...fixture, id: 999 }); // nothing with id 999
      } catch (err) {
        captured = err;
      }
    });

    it("throws InsightNotFoundError", () => {
      expect(captured).toBeInstanceOf(InsightNotFoundError);
      expect((captured as Error).message).toEqual(
        "Insight with id 999 not found",
      );
    });
  });
});
