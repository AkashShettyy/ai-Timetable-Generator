import express from "express";
import multer from "multer";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { uploadCSV, sendFacultyAlerts, sendFollowUpEmails, sendUnavailabilityAlert, getNotifications, markNotificationRead } from "../controllers/uploadController.js";

const router = express.Router();

// Configure multer (store temporary files in /tmp)
const upload = multer({ dest: "tmp/" });

router.post("/upload", protect, adminOnly, upload.single("file"), uploadCSV);
router.post("/send-faculty-alerts", protect, adminOnly, sendFacultyAlerts);
router.post("/send-follow-up", protect, adminOnly, sendFollowUpEmails);
router.post("/faculty-unavailable-alert", protect, sendUnavailabilityAlert);
router.get("/notifications", protect, adminOnly, getNotifications);
router.put("/notifications/:id/read", protect, adminOnly, markNotificationRead);

export default router;
