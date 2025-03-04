import express, { Request, Response, NextFunction } from "express";
import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { Queue } from "bullmq";
import taskRoutes from "./routes/taskRoutes";
import monitorRoutes from "./routes/monitorRoutes";
import redisClient from "./config/redis.config";
import errorHandler from "./middleware/errorhandler.middleware";
import { IError } from "./types/error.type";

const app = express();

app.use(express.json());


app.get("/api", (req: Request, res: Response) => {
  res.json({ message: "API is running" });
});


const taskQueue = new Queue("task-queue", { connection: redisClient });


const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");
createBullBoard({
  queues: [new BullMQAdapter(taskQueue)],
  serverAdapter,
});


app.use("/api", taskRoutes);
app.use("/api", monitorRoutes);
app.use("/admin/queues", serverAdapter.getRouter());


app.use((err: IError, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

export default app; 
