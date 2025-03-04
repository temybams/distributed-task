import dotenv from "dotenv";
dotenv.config();


if (!process.env.REDIS_HOST) throw new Error("REDIS_HOST is missing in .env");
if (!process.env.PORT) throw new Error("PORT is missing in .env");

export default {
  redis: {
    host: process.env.REDIS_HOST || "task-queue_redis",
    port: Number(process.env.REDIS_PORT) || 6379,
  },
  server: {
    port: Number(process.env.PORT) || 3000,
  },
};
