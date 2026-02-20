// backend/models/Batch.js
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    code: String,
    title: String,
    credits: Number,
    total_hours: Number,
    assigned_faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      default: null,
    },
  },
  { timestamps: true }
);

const batchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, enum: ["major", "minor", "optional"] },
    category: { type: String, enum: ["major", "minor", "optional"], required: true },
    courses: [courseSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Batch", batchSchema);
