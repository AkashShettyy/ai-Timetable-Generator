import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    // 🔗 Linked user account
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🎓 Academic details
    program: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    major_subject: {
      type: String,
      trim: true,
    },
    minor_subject: {
      type: String,
      trim: true,
    },

    // 📚 Courses
    enrolled_courses: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Course" }
    ],
    major_courses: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Course" }
    ],
    minor_courses: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Course" }
    ],
    optional_courses: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Course" }
    ],

    // 🧩 Academic Work
    projects: [
      {
        name: { type: String, required: true },
        description: { type: String },
        technologies: { type: String },
        githubLink: { type: String },
        created_at: { type: Date, default: Date.now },
      },
    ],

    internships: [
      {
        role: { type: String },
        company: { type: String },
        duration: { type: String },
        created_at: { type: Date, default: Date.now },
      },
    ],

    // 📅 Record timestamps
    created_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

export default mongoose.model("Student", studentSchema);
