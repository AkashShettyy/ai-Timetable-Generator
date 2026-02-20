import Student from "../models/Student.js";

/* ============================================================
   🧑‍💼 Admin: Create a Student Record
   ============================================================ */
export const createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ============================================================
   🎓 Student: Self-Registration after Login
   ============================================================ */
export const registerStudent = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if already exists
    const existingStudent = await Student.findOne({ user_id: userId });
    if (existingStudent) {
      return res.status(400).json({ message: "Student already registered" });
    }

    const studentData = { user_id: userId, ...req.body };
    const student = await Student.create(studentData);

    const populated = await Student.findById(student._id)
      .populate("user_id", "name email")
      .populate("major_courses", "code title credits")
      .populate("minor_courses", "code title credits")
      .populate("optional_courses", "code title credits");

    // Generate AI timetable for the student
    try {
      const { generateAndSaveStudentTimetable } = await import('./timetableController.js');
      const allCourses = [
        ...req.body.major_courses,
        ...req.body.minor_courses,
        ...req.body.optional_courses
      ];
      console.log('📅 Starting timetable generation for student:', userId);
      console.log('📚 Courses to schedule:', allCourses.length);
      
      const result = await generateAndSaveStudentTimetable(userId, allCourses);
      console.log('✅ Timetable generated and saved for student:', userId, 'Sessions:', result.length);
    } catch (timetableError) {
      console.error('⚠️ Timetable generation failed:', timetableError);
      console.error('Stack trace:', timetableError.stack);
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ============================================================
   🎓 Get Student Profile (Logged-in Student)
   ============================================================ */
export const getStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const student = await Student.findOne({ user_id: userId })
      .populate("user_id", "name email")
      .populate("major_courses", "code title credits")
      .populate("minor_courses", "code title credits")
      .populate("optional_courses", "code title credits");

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================
   🎓 Update Student Profile (Logged-in Student)
   ============================================================ */
export const updateStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const student = await Student.findOneAndUpdate(
      { user_id: userId },
      req.body,
      { new: true }
    )
      .populate("user_id", "name email")
      .populate("major_courses", "code title credits")
      .populate("minor_courses", "code title credits")
      .populate("optional_courses", "code title credits");

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    // Regenerate timetable when profile is updated
    try {
      const { generateAndSaveStudentTimetable } = await import('./timetableController.js');
      const allCourses = [
        ...req.body.major_courses,
        ...req.body.minor_courses,
        ...req.body.optional_courses
      ];
      console.log('📅 Regenerating timetable for student:', userId);
      console.log('📚 Updated courses:', allCourses.length);
      
      const result = await generateAndSaveStudentTimetable(userId, allCourses);
      console.log('✅ Timetable regenerated for updated student:', userId, 'Sessions:', result.length);
    } catch (timetableError) {
      console.error('⚠️ Timetable regeneration failed:', timetableError);
      console.error('Stack trace:', timetableError.stack);
    }

    res.status(200).json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ============================================================
   🧩 Add a Project (Student)
   ============================================================ */
export const addProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, technologies, githubLink } = req.body;

    const student = await Student.findOneAndUpdate(
      { user_id: userId },
      { $push: { projects: { name, description, technologies, githubLink } } },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const newProject = student.projects[student.projects.length - 1];
    res.status(200).json(newProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ============================================================
   ✏️ Update a Project (Student)
   ============================================================ */
export const updateProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId } = req.params;
    const { name, description, technologies, githubLink } = req.body;

    const student = await Student.findOneAndUpdate(
      { user_id: userId, "projects._id": projectId },
      {
        $set: {
          "projects.$.name": name,
          "projects.$.description": description,
          "projects.$.technologies": technologies,
          "projects.$.githubLink": githubLink,
        },
      },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ message: "Project updated successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ============================================================
   ❌ Delete a Project (Student)
   ============================================================ */
export const deleteProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId } = req.params;

    const student = await Student.findOneAndUpdate(
      { user_id: userId },
      { $pull: { projects: { _id: projectId } } },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ============================================================
   🧠 Add an Internship (Student)
   ============================================================ */
export const addInternship = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role, company, duration } = req.body;

    const student = await Student.findOneAndUpdate(
      { user_id: userId },
      { $push: { internships: { role, company, duration } } },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const newInternship = student.internships[student.internships.length - 1];
    res.status(200).json(newInternship);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ============================================================
   🧑‍💼 Admin: Get All Students
   ============================================================ */
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate("user_id", "name email")
      .populate("major_courses", "title code")
      .populate("minor_courses", "title code")
      .populate("optional_courses", "title code");
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================
   🧑‍💼 Admin: Update a Student by ID
   ============================================================ */
export const updateStudent = async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ============================================================
   🧑‍💼 Admin: Delete a Student
   ============================================================ */
export const deleteStudent = async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Student not found" });
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
