import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "redis",
  port: Number(process.env.REDIS_PORT) || 6379,
});

redisClient.on("connect", () => console.log("Connected to Redis"));
redisClient.on("error", (err:any) => console.error("Redis Error:", err));

export default redisClient;
