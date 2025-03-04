import { Queue } from "bullmq"
import redisClient from "../config/redis.config";;


const taskQueue = new Queue("task-queue", {
  connection: redisClient,
});

export default taskQueue;