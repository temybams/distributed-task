import { Request, Response } from "express";
import  taskQueue  from "../queue/taskQueue";
import { logger } from "../utils/logger";
import catchAsync from "../middleware/catchasync.middleware";
import throwError from "../utils/error";


export const enqueueTask = catchAsync(async (req: Request, res: Response) => {
  const { task } = req.body;
  if (!task) throwError("Task data is required", 400);  

  const job = await taskQueue.add("process-task", { task });
  if (!job) throwError("Failed to enqueue task", 500);

  logger.info(`Task enqueued: ${job.id}`);
  res.status(200).json({ jobId: job.id, message: "Task enqueued successfully." });
});

