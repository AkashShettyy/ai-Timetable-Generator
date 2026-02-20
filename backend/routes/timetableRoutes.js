import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  generateNaiveTimetable,
  getLatestTimetable,
  getStudentTimetable,
  updateTimetable,
} from "../controllers/timetableController.js";

const router = express.Router();

// Admin can generate a new timetable
router.post("/generate", protect, adminOnly, generateNaiveTimetable);

// Anyone (logged in) can view the latest timetable
router.get("/latest", protect, getLatestTimetable);

// Student-specific timetable
router.get("/student", protect, getStudentTimetable);

// Admin can update the timetable
router.put("/update", protect, adminOnly, updateTimetable);

export default router;
