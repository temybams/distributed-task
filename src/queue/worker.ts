import { Worker, Job } from "bullmq";
import Redlock from "redlock";
import redisClient from "../config/redis.config";
import { logger } from "../utils/logger";
import throwError from "../utils/error";

const MAX_RETRIES = 3;
const LOCK_TTL = 5000;
const PROCESSING_TIME = parseInt(process.env.PROCESSING_TIME || "5000", 10);
// Redis distributed lock setup
const redlock = new Redlock([redisClient], {
  retryCount: 5,
  retryDelay: 200,
});


export const processJob = async (job: Job) => {
  const lockKey = `lock:${job.id}`;
  let lock;

  try {
    // Acquire lock before processing
    lock = await redlock.acquire([lockKey], LOCK_TTL);
    logger.info(`Lock acquired for Job ${job.id}`);

    // Simulate job execution
    logger.info(`⚙️ Processing job ${job.id}: ${JSON.stringify(job.data)}`);
    await new Promise((res) => setTimeout(res, PROCESSING_TIME));

    logger.info(`Job ${job.id} processed successfully.`);
    return { success: true };
  } catch (error: any) {
    logger.error(`Job ${job.id} failed: ${error.message}`);

    // Exponential backoff retry logic
    const retries = job.attemptsMade || 0;
    if (retries < MAX_RETRIES) {
      const delay = Math.pow(2, retries) * 1000;
      logger.warn(`Retrying job ${job.id} in ${delay / 1000}s (Attempt ${retries + 1}/${MAX_RETRIES})`);

      await new Promise((res) => setTimeout(res, delay));
      await job.retry();
    } else {
      logger.error(`Max retries reached for job ${job.id}, moving to failed queue.`);
    }

    throw error;
  } finally {

    if (lock) {
      try {
        await lock.release();
        logger.info(`Lock released for Job ${job.id}`);
      } catch (lockError: unknown) {
        if (lockError instanceof Error) {
          logger.error(`⚠️ Failed to release lock for Job ${job.id}: ${lockError.message}`);
        } else {
          logger.error(`⚠️ Failed to release lock for Job ${job.id}: Unknown error`, lockError);
        }
      }
    }
  }
};


export const taskWorker = new Worker(
  "task-queue",
  async (job) => {
    try {
      return await processJob(job);
    } catch (error: any) {
      logger.error(`Worker failed for Job ${job?.id}: ${error.message}`);
      return Promise.reject(throwError(`Worker processing failed: ${error.message}`, 500));
    }
  },
  {
    connection: redisClient,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || "5", 10),
  }
);




taskWorker.on("completed", (job) => logger.info(`Job ${job?.id} completed`));
taskWorker.on("failed", (job, err) => logger.error(` Job ${job?.id} failed: ${err.message}`));

logger.info(" Worker started successfully...");
