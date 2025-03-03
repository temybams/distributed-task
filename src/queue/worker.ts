import { Worker, Job } from "bullmq";
import redisClient from "../config/redis.config";
import { logger } from "../utils/logger";
import throwError from "../utils/error";

/**
 * Process job function with proper type
 */
 export const processJob = async (job: Job) => {
  if (!job.data) throwError("Job data is missing", 400);

  logger.info(`Processing job ${job.id}: ${JSON.stringify(job.data)}`);
  await new Promise((res) => setTimeout(res, 5000)); // Simulate processing time
  return { success: true };
};

/**
 * Worker that processes tasks from "task-queue"
 */
export const taskWorker = new Worker(
  "task-queue",
  async (job: Job | undefined) => {
    if (!job) {
      logger.error("Received an undefined job.");
      return;
    }
    try {
      return await processJob(job);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error(`Job ${job.id} failed: ${errorMessage}`);
      throw error;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
    },
});

/**
 * Event listeners for worker
 */
taskWorker.on("completed", (job: Job) => {
  logger.info(`Job ${job.id} completed`);
});

taskWorker.on("failed", (job: Job | undefined, err: Error) => {
  if (job) {
    logger.error(`Job ${job.id} failed: ${err.message}`);
  } else {
    logger.error(`A job failed, but job details are unavailable: ${err.message}`);
  }
});
