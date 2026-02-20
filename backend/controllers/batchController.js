import Batch from "../models/Batch.js";
import Faculty from "../models/Faculty.js";
import Course from "../models/Course.js";

// 🟢 Create Batch (auto-loads category courses)
export const createBatch = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate category name
    const validCategories = ["major", "minor", "optional"];
    if (!validCategories.includes(name.toLowerCase())) {
      return res
        .status(400)
        .json({ message: "Batch name must be one of: major, minor, optional" });
    }

    // Check if batch already exists
    const existing = await Batch.findOne({ name: name.toLowerCase() });
    if (existing)
      return res.status(400).json({ message: "This batch already exists" });

    // Get all courses in that category
    const courses = await Course.find({ category: name.toLowerCase() });

    // Create embedded course records
    const batchCourses = courses.map((c) => ({
      course_id: c._id,
      code: c.code,
      title: c.title,
      credits: c.credits,
      total_hours: c.total_hours,
    }));

    const batch = await Batch.create({
      name: name.toLowerCase(),
      category: name.toLowerCase(),
      courses: batchCourses,
    });

    res.status(201).json({
      message: `${name} batch created successfully with ${batchCourses.length} courses.`,
      batch,
    });
  } catch (err) {
    console.error("Create batch error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🟢 Get all batches
export const getBatches = async (req, res) => {
  try {
    const batches = await Batch.find();
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 Get courses in a batch
export const getCoursesByBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id).populate({
      path: "courses.assigned_faculty",
      populate: { path: "user_id", select: "name email" },
    });
    if (!batch) return res.status(404).json({ message: "Batch not found" });
    res.json(batch.courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 Assign faculty to a course
export const assignFacultyToCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { facultyId } = req.body;

    const batch = await Batch.findOne({ "courses._id": courseId });
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    const faculty = await Faculty.findById(facultyId).populate(
      "user_id",
      "name email"
    );
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    const course = batch.courses.id(courseId);
    course.assigned_faculty = faculty._id;
    await batch.save();

    const updated = await Batch.findOne({ "courses._id": courseId }).populate({
      path: "courses.assigned_faculty",
      populate: { path: "user_id", select: "name email" },
    });

    res.json({
      message: `Faculty ${faculty.user_id?.name || "N/A"} assigned successfully`,
      course: updated.courses.id(courseId),
    });
  } catch (err) {
    console.error("Assign error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🟡 Unassign faculty from a course
export const unassignFacultyFromCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const batch = await Batch.findOne({ "courses._id": courseId });
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    const course = batch.courses.id(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.assigned_faculty = null;
    await batch.save();

    res.json({ message: "Faculty unassigned successfully" });
  } catch (err) {
    console.error("Unassign error:", err);
    res.status(500).json({ message: err.message });
  }
};
