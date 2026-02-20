import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "faculty", "student"], default: "student" },
    otp: { type: String },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false }, // For faculty approval
    facultyId: { type: String }, // For faculty unique ID
    usn: { type: String }, // For student unique ID
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
