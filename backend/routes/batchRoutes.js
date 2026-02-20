import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { createBatch, getBatches } from "../controllers/batchController.js";

const router = express.Router();

// 🟢 Optional: still allow admin to create or view custom batches if needed
router.post("/", protect, adminOnly, createBatch);
router.get("/", protect, adminOnly, getBatches);

export default router;
