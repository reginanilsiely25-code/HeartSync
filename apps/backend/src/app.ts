import cors from "@fastify/cors";
import Fastify from "fastify";
import { ZodError } from "zod";
import { registerCoupleRoutes } from "./routes/couples";
import { registerDailySyncRoutes } from "./routes/dailySyncs";
import { registerDemoRoutes } from "./routes/demo";
import { registerInsightRoutes } from "./routes/insights";
import { registerPlanRoutes } from "./routes/plans";
import { registerSyncCardRoutes } from "./routes/syncCards";
import { registerUserRoutes } from "./routes/users";

export function buildApp() {
  const app = Fastify({ logger: false });
  app.register(cors, { origin: true });
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: { code: "invalid_input", message: error.issues[0]?.message ?? "Invalid request input" } });
    }
    return reply.status(500).send({ error: { code: "invalid_input", message: error.message } });
  });
  app.get("/health", async () => ({ ok: true }));
  registerUserRoutes(app);
  registerCoupleRoutes(app);
  registerSyncCardRoutes(app);
  registerDailySyncRoutes(app);
  registerPlanRoutes(app);
  registerInsightRoutes(app);
  registerDemoRoutes(app);
  return app;
}
