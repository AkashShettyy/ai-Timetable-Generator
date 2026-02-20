import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  // Admin routes
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent,

  // Student routes
  registerStudent,
  getStudentProfile,
  updateStudentProfile,

  // Student activities
  addProject,
  updateProject,
  deleteProject,
  addInternship,
} from "../controllers/studentController.js";

const router = express.Router();

/* ============================================================
   🎓 STUDENT ROUTES (Self-Service)
   ============================================================ */

// 📝 Register as a student (after account login)
router.post("/register", protect, registerStudent);

// 👤 Get or update personal student profile
router
  .route("/profile")
  .get(protect, getStudentProfile)
  .put(protect, updateStudentProfile);

// 💼 Manage Projects
router.post("/projects", protect, addProject);
router.put("/projects/:projectId", protect, updateProject);
router.delete("/projects/:projectId", protect, deleteProject);

// 🧠 Manage Internships
router.post("/internships", protect, addInternship);

// 📅 Regenerate timetable with new courses
router.post("/regenerate-timetable", protect, async (req, res) => {
  try {
    const { generateAndSaveStudentTimetable } = await import('../controllers/timetableController.js');
    const { major_courses, minor_courses, optional_courses } = req.body;
    const allCourses = [...major_courses, ...minor_courses, ...optional_courses];
    
    await generateAndSaveStudentTimetable(req.user._id, allCourses);
    res.json({ message: 'Timetable regenerated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to regenerate timetable', error: err.message });
  }
});

/* ============================================================
   🧑‍💼 ADMIN ROUTES
   ============================================================ */

// 👩‍💻 Get all students / Create a new student record
router
  .route("/")
  .get(protect, getStudents)
  .post(protect, adminOnly, createStudent);

// ✏️ Update or Delete a specific student
router
  .route("/:id")
  .put(protect, adminOnly, updateStudent)
  .delete(protect, adminOnly, deleteStudent);

export default router;
