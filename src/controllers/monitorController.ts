import { Request, Response } from "express";
import { Queue } from "bullmq";
import redisClient from "../config/redis.config";
import { logger } from "../utils/logger";
import catchAsync from "../middleware/catchasync.middleware";
import throwError from "../utils/error";
import config from "../config/index";

const taskQueue = new Queue("task-queue", {
    connection: {
      host: config.redis.host,
      port: config.redis.port,
    },
  });


export const getJobStatus = catchAsync(async (req: Request, res: Response) => {
    const job = await taskQueue.getJob(req.params.id);
    if (!job) throwError("Job not found", 404);
  
    logger.info(`Fetched job status for job ${job.id}`);
    res.json({ id: job.id, status: await job.getState(), data: job.data });
  });