import Fastify from "fastify";
import pino from "pino";

console.log("BOOT: reached entrypoint"); // should appear immediately
process.stdout.write("BOOT: stdout write\n"); // should appear too
const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
  },
  pino.destination(1)
); // 1 = stdout

export const fastify = Fastify({
  logger,
  disableRequestLogging: false,
});
