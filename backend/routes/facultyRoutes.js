import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  createFaculty,
  getFaculty,
  updateFaculty,
  deleteFaculty,
  getPendingFaculty,
  approveFaculty,
  getMyFacultyProfile,
  updateMyFacultyProfile,
  syncAvailabilityWithSchedule,
} from "../controllers/facultyController.js";

const router = express.Router();

// Faculty routes
router.route("/")
  .get(protect, getFaculty)
  .post(protect, adminOnly, createFaculty);

// Faculty personal profile routes (MUST be before /:id routes)
router.get("/me", protect, getMyFacultyProfile);
router.put("/me", protect, updateMyFacultyProfile);
router.post("/sync-availability", protect, syncAvailabilityWithSchedule);

// Admin verification routes
router.get("/pending", protect, adminOnly, getPendingFaculty);
router.post("/approve/:facultyId", protect, adminOnly, approveFaculty);

// Update or delete a specific faculty (admin only)
router.route("/:id")
  .put(protect, adminOnly, updateFaculty)
  .delete(protect, adminOnly, deleteFaculty);

export default router;
