import express from "express";
import { getJobStatus } from "../controllers/monitorController";

const router = express.Router();

router.get("/status/:id", getJobStatus);

export default router;
