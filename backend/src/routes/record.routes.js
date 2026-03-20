import express from "express";
import RecordController from "../controllers/....js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();



// Upload prescription or report
router.post("/upload", authMiddleware, RecordController.uploadRecord);

// Get all hospital visits
router.get("/visits", authMiddleware, RecordController.getVisits);

// Get all prescriptions/reports
router.get("/records", authMiddleware, RecordController.getRecords);


export default router;