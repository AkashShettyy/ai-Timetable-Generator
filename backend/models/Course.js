import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    // 🔗 Linked Batch (optional)
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },

    // 📅 Semester
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },

    // 🧾 Course Information
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    credits: {
      type: Number,
      required: true,
      min: 0,
    },
    total_hours: {
      type: Number,
      default: 3,
      min: 1,
    },

    // 🏷️ Course Category
    category: {
      type: String,
      enum: ["major", "minor", "optional"],
      required: true,
    },

    // 👨‍🏫 Faculty Assignment
    assigned_faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      default: null,
    },

    // 📅 Creation Timestamp
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

export default mongoose.model("Course", courseSchema);
