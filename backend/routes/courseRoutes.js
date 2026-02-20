import express from "express";
import {
  createCourse,
  getCourses,
  getCoursesByCategory,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ============================================================
   🧑‍🎓 Public/Student Routes
   ============================================================ */

// Get all or filtered courses (optionally by ?category=major)
router.get("/", protect, getCourses);

// Get courses grouped by category (major/minor/optional)
router.get("/by-category", protect, getCoursesByCategory);

// Get courses by category name (e.g. /category/major)
router.get("/category/:name", protect, async (req, res) => {
  try {
    const category = req.params.name.toLowerCase();
    const courses = await import("../models/Course.js")
      .then((m) => m.default.find({ category }));
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   🧑‍💼 Admin Routes
   ============================================================ */

// ➕ Add a new course
router.post("/", protect, adminOnly, async (req, res, next) => {
  try {
    const { code, title, credits, total_hours, category } = req.body;
    if (!code || !title || !credits || !total_hours || !category)
      return res
        .status(400)
        .json({ message: "All fields (code, title, credits, total_hours, category) are required" });

    // Pass to controller
    return createCourse(req, res, next);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✏️ Update existing course
router.put("/:id", protect, adminOnly, updateCourse);

// ❌ Delete a course
router.delete("/:id", protect, adminOnly, deleteCourse);

export default router;
