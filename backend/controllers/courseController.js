import Course from "../models/Course.js";

/* ============================================================
   ➕ Create a new course (Admin)
   ============================================================ */
export const createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ============================================================
   📋 Get all courses (Admin + Student)
   Supports optional query: /courses?category=major
   ============================================================ */
export const getCourses = async (req, res) => {
  try {
    const { category, semester } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (semester) filter.semester = parseInt(semester);
    
    const courses = await Course.find(filter).populate("batch assigned_faculty");
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================
   🎓 Get Courses by Category and Semester (Student)
   Returns structured { major, minor, optional } for specific semester
   ============================================================ */
export const getCoursesByCategory = async (req, res) => {
  try {
    const { semester } = req.query;
    
    if (!semester) {
      return res.status(400).json({ message: "Semester parameter is required" });
    }
    
    const semesterNum = parseInt(semester);
    if (semesterNum < 1 || semesterNum > 8) {
      return res.status(400).json({ message: "Semester must be between 1 and 8" });
    }

    const majorCourses = await Course.find({ category: "major", semester: semesterNum });
    const minorCourses = await Course.find({ category: "minor", semester: semesterNum });
    const optionalCourses = await Course.find({ category: "optional", semester: semesterNum });

    res.status(200).json({
      major: majorCourses,
      minor: minorCourses,
      optional: optionalCourses,
    });
  } catch (err) {
    console.error("⚠️ Error fetching courses by semester:", err.message);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

/* ============================================================
   ✏️ Update a Course (Admin)
   ============================================================ */
export const updateCourse = async (req, res) => {
  try {
    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Course not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ============================================================
   ❌ Delete a Course (Admin)
   ============================================================ */
export const deleteCourse = async (req, res) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Course not found" });
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
