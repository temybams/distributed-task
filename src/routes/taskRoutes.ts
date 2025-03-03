import express from "express";
import { enqueueTask } from "../controllers/taskController";

const router = express.Router();


router.post("/enqueue", enqueueTask);

export default router;
