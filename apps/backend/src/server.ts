import { buildApp } from "./app";
import { config } from "./config";

const app = buildApp();

await app.listen({ port: config.port, host: config.host });
