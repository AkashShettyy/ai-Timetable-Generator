import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  version_name: { type: String, default: "v1" },
  data: { type: Array, default: [] },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("Timetable", timetableSchema);
