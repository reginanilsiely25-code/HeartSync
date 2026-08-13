import type { FastifyInstance } from "fastify";
import { resetDemoData } from "../domain/demoData";

export function registerDemoRoutes(app: FastifyInstance) {
  app.post("/demo/reset", async () => resetDemoData());
}
