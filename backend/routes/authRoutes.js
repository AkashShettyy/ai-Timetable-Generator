import express from "express";
import {
  sendOTP,
  verifyOTP,
  login,
  getMe,
  getPendingFaculties,
  approveFaculty,
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ============================================================
   🌐 PUBLIC ROUTES (No Authentication Required)
   ============================================================ */

// Step 1: Signup → sends OTP
router.post("/signup", sendOTP);

// Step 2: Verify OTP
router.post("/verify-otp", verifyOTP);

// Step 3: Login
router.post("/login", login);

/* ============================================================
   🔐 AUTHENTICATED ROUTES (For any logged-in user)
   ============================================================ */

// Get current user info (for dashboards / session validation)
router.get("/me", protect, getMe);

/* ============================================================
   🧑‍💼 ADMIN ROUTES (Restricted Access)
   ============================================================ */

// Get list of pending faculty members awaiting approval
router.get("/pending-faculties", protect, adminOnly, getPendingFaculties);

// Approve a specific faculty member
router.post("/approve-faculty/:facultyId", protect, adminOnly, approveFaculty);

export default router;
