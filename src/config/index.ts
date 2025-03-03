import dotenv from "dotenv";
dotenv.config();

export default {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
  },
  server: {
    port: Number(process.env.PORT) || 3000,
  },
};
