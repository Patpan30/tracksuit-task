import * as oak from "@oak/oak";
import { Port } from "../lib/utils/index.ts";
import { getDb } from "./database/sqlite.database.ts";
import { insightsRouter } from "./routes/insights.router.ts";
import { healthRouter } from "./routes/health.router.ts";
import { log } from "./deps.ts";

log.info("Loading configuration");

const env = {
  port: Port.parse(Deno.env.get("SERVER_PORT")),
};

log.info("Initialising server");

const router = new oak.Router();
router
  .use(healthRouter.routes(), healthRouter.allowedMethods())
  .use(insightsRouter.routes(), insightsRouter.allowedMethods());

const app = new oak.Application();

const db = await getDb();
app.use((ctx, next) => {
  ctx.state.db = db;
  return next();
});

app.use(router.routes(), router.allowedMethods());

app.listen(env);
log.info(`Started server on port ${env.port}`);
