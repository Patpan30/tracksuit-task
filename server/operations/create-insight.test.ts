import { expect } from "jsr:@std/expect";
import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import { withDB } from "../testing.ts"; // your fixture helper
import createInsight from "./create-insight.ts";
import type { Row } from "$tables/insights.ts";

/* ---------------------------------------------------------------------
* 1. Creating an insight  ➜ should persist in the DB
* -------------------------------------------------------------------*/
describe("creating an insight in the DB", () => {
  describe("valid payload", () => {
    withDB((fixture) => {
      const payload = { brand: 7, text: "foo" };
      let rows: Row[];

      beforeAll(() => {
        createInsight({ ...fixture, ...payload });
        rows = fixture.insights.selectAll();
      });

      it("persists exactly one record", () => {
        expect(rows.length).toEqual(1);
      });

      it("stores the correct data", () => {
        // `createdAt` is assigned inside the function, so just assert the other props
        expect(rows[0]).toMatchObject({
          id: 1, // AUTOINCREMENT starts at 1 in an empty :memory: DB
          brand: payload.brand,
          text: payload.text,
        });
      });
    });
  });

  /* ---------------------------------------------------------------------
 * 2. Failing insert  ➜ should throw
 * -------------------------------------------------------------------*/
  describe("insert fails inside SQLite (prepare().run() → 0)", () => {
    withDB((fixture) => {
      let capturedError: unknown;

      beforeAll(() => {
        // Monkey-patch `db.prepare` so that `.run()` returns 0
        // (simulate a failed INSERT without affecting other tests)
        const originalPrepare = fixture.db.prepare.bind(fixture.db);

        // deno-lint-ignore no-explicit-any
        (fixture.db as any).prepare = () => ({
          run: () => 0, // force failure path
        });

        try {
          createInsight({ ...fixture, brand: 1, text: "should fail" });
        } catch (err) {
          capturedError = err;
        } finally {
          // restore the real prepare method
          // deno-lint-ignore no-explicit-any
          (fixture.db as any).prepare = originalPrepare;
        }
      });

      it("throws the expected error", () => {
        expect(capturedError).toBeInstanceOf(Error);
        expect((capturedError as Error).message).toEqual(
          "Failed to create insight",
        );
      });
    });
  });
});
