import { Request, Response } from "express";
import { taskQueue } from "../queue/taskQueue";
import { logger } from "../utils/logger";
import catchAsync from "../middleware/catchasync.middleware";
import throwError from "../utils/error";

/**
 * Enqueue a task into the queue
 */
export const enqueueTask = catchAsync(async (req: Request, res: Response) => {
  const { data } = req.body;
  if (!data) throwError("Task data is required", 400);

  const job = await taskQueue.add("process-task", data);
  if (!job) throwError("Failed to enqueue task", 500);

  logger.info(`Task enqueued: ${job.id}`);
  res.status(200).json({ jobId: job.id, message: "Task enqueued successfully." });
});
