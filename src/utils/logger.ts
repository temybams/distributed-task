import pino from "pino";

/**
 * Logger instance using Pino
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty", // Pretty-print logs in development
    options: { colorize: true },
  },
});
