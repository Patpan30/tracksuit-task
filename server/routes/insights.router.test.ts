import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { superoak } from "https://deno.land/x/superoak@5.0.0/mod.ts";
import { Application } from "@oak/oak";
import { insightsRouter } from "../routes/insights.router.ts";
import { Database } from "@db/sqlite";
import * as insightsTable from "$tables/insights.ts";

/* ------------------------------------------------------------------ *
 * Helper: build a fresh app with an in-memory DB
 * ------------------------------------------------------------------ */
function buildApp() {
  const db = new Database(":memory:");
  db.exec(insightsTable.createTable); // bootstrap schema

  const app = new Application();

  // inject db into ctx.state for every request
  app.use((ctx, next) => {
    ctx.state.db = db;
    return next();
  });

  // mount router
  app.use(insightsRouter.routes());
  app.use(insightsRouter.allowedMethods());

  return { app, db };
}

/* ------------------------------------------------------------------ *
 * 1. Empty DB → list endpoint returns []
 * ------------------------------------------------------------------ */
describe("GET /insights on empty DB", () => {
  const { app } = buildApp();

  it("responds 200 with an empty array", async () => {
    const req = await superoak(app);
    await req.get("/insights")
      .expect(200)
      .expect("Content-Type", /json/)
      .expect((res) => expect(res.body).toEqual([]));
  });
});

/* ------------------------------------------------------------------ *
 * 2. Full CRUD round-trip
 * ------------------------------------------------------------------ */
describe("full CRUD flow", () => {
  const { app } = buildApp();
  let createdId: number;

  /* -------- CREATE ------------------------------------------------- */
  it("POST /insights/create returns 201", async () => {
    const req = await superoak(app);
    await req.post("/insights/create")
      .send({ brand: 99, text: "integration-test" })
      .expect(201);
  });

  /* -------- LIST --------------------------------------------------- */
  it("GET /insights now returns one record", async () => {
    const req = await superoak(app);
    await req.get("/insights")
      .expect(200)
      .expect(({ body }) => {
        expect(body.length).toEqual(1);
        createdId = body[0].id; // capture ID for later steps
      });
  });

  /* -------- LOOKUP ------------------------------------------------- */
  it("GET /insights/:id returns that record", async () => {
    const req = await superoak(app);
    await req.get(`/insights/${createdId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: createdId,
          brand: 99,
          text: "integration-test",
        });
      });
  });

  /* -------- DELETE ------------------------------------------------- */
  it("DELETE /insights/delete/:id returns 204", async () => {
    const req = await superoak(app);
    await req.delete(`/insights/delete/${createdId}`)
      .expect(204);
  });

  /* -------- VERIFY DELETION --------------------------------------- */
  it("GET /insights/:id now returns 404", async () => {
    const req = await superoak(app);
    await req.get(`/insights/${createdId}`)
      .expect(404);
  });
});

/* ------------------------------------------------------------------ *
 * 3. Bad-input branch
 * ------------------------------------------------------------------ */
describe("GET /insights/:id with non-numeric id", () => {
  const { app } = buildApp();

  it("responds 400", async () => {
    const req = await superoak(app);
    await req.get("/insights/not-a-number")
      .expect(400)
      .expect(({ body }) => expect(body.error).toEqual("id must be a number"));
  });
});

/* ------------------------------------------------------------------ *
 * 4. DELETE with non-numeric id
 * ------------------------------------------------------------------ */
describe("DELETE /insights/:id with non-numeric id", () => {
  const { app } = buildApp();

  it("responds 400", async () => {
    const req = await superoak(app);
    await req.delete("/insights/delete/not-a-number")
      .expect(400)
      .expect(({ body }) => expect(body.error).toEqual("id must be a number"));
  });
});
