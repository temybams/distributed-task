import { Worker, Job } from "bullmq";
import Redlock from "redlock";
import redisClient from "../config/redis.config";
import { logger } from "../utils/logger";
import throwError from "../utils/error";

const redlock = new Redlock([redisClient], {
  retryCount: 5, 
  retryDelay: 200,
});

export const processJob = async (job: Job) => {
  const lockKey = `lock:${job.id}`;
  let lock;

  try {
    lock = await redlock.acquire([lockKey], 5000);
    logger.info(`Lock acquired for Job ${job.id}`);

    // Simulating job execution
    logger.info(`⚙️ Processing job ${job.id}: ${JSON.stringify(job.data)}`);
    await new Promise((res) => setTimeout(res, 5000));

    return { success: true };
  } catch (error: any) {
    logger.error(`Job ${job.id} failed: ${error.message}`);
    const retries = job.attemptsMade || 0;
    if (retries < 3) {
      logger.info(`Retrying job ${job.id} (Attempt ${retries + 1}/3)`);
      await job.retry();
    } else {
      logger.error(`Max retries reached for job ${job.id}`);
    }
    throw error;
  } finally {
    if (lock) {
      await lock.release();
      logger.info(`Lock released for Job ${job.id}`);
    }
  }
};


//  Adds Worker for Processing Tasks
export const taskWorker = new Worker(
  "task-queue",
  async (job) => {
    try {
      return await processJob(job);
    } catch (error: any) {
      logger.error(`Job ${job?.id} failed: ${error.message}`);
      return Promise.reject(throwError(`Worker processing failed: ${error.message}`, 500));
    }
  },
  { connection: redisClient }
);

taskWorker.on("completed", (job) => logger.info(`Job ${job?.id} completed`));
taskWorker.on("failed", (job, err) => logger.error(`Job ${job?.id} failed: ${err.message}`));
