import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Faculty from "../models/Faculty.js";
import {
  sendEmailOTP,
  sendWelcomeEmail,
  sendFacultyApprovedEmail,
} from "../utils/otpUtils.js";

/* ============================================================
   📩 STEP 1: Send OTP during Signup
   ============================================================ */
export const sendOTP = async (req, res) => {
  try {
    const { name, email, password, role, facultyId, usn } = req.body;

    if (!role) return res.status(400).json({ message: "Role is required" });
    if (role === "faculty" && !facultyId)
      return res.status(400).json({ message: "Faculty ID is required" });
    if (role === "student" && !usn)
      return res.status(400).json({ message: "USN is required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 min

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
      role,
      facultyId: role === "faculty" ? facultyId : null,
      usn: role === "student" ? usn : null,
    });

    try {
      await sendEmailOTP(email, otp);
      res.status(200).json({ message: "OTP sent to email", userId: user._id });
    } catch (emailError) {
      console.warn("Email service error:", emailError.message);
      res.status(200).json({
        message:
          "Account created. Email service temporarily unavailable. Use OTP: " +
          otp,
        userId: user._id,
        otp: otp, // only for testing fallback
      });
    }
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

/* ============================================================
   ✅ STEP 2: Verify OTP
   ============================================================ */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpires < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;

    // Auto-approve Admin and Student, but Faculty requires Admin approval
    if (user.role !== "faculty") {
      user.isApproved = true;
    }

    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user);
    } catch (e) {
      console.warn("Welcome email error:", e.message);
    }

    res.status(200).json({
      message:
        user.role === "faculty"
          ? "Email verified successfully. Awaiting admin approval."
          : "Account verified successfully. You can now login.",
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

/* ============================================================
   🔐 STEP 3: Login User
   ============================================================ */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isVerified)
      return res.status(403).json({ message: "Please verify your email first" });

    if (user.role === "faculty" && !user.isApproved)
      return res.status(403).json({ message: "Faculty approval pending by admin" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        facultyId: user.facultyId,
        usn: user.usn,
        isVerified: user.isVerified,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

/* ============================================================
   🧾 STEP 4: Admin - Get Pending Faculties
   ============================================================ */
export const getPendingFaculties = async (req, res) => {
  try {
    const pending = await User.find({
      role: "faculty",
      isApproved: false,
      isVerified: true,
    });
    res.status(200).json(pending);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending faculties" });
  }
};

/* ============================================================
   ✅ STEP 5: Admin - Approve Faculty
   ============================================================ */
export const approveFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const faculty = await User.findById(facultyId);

    if (!faculty) return res.status(404).json({ message: "Faculty not found" });
    if (faculty.role !== "faculty")
      return res.status(400).json({ message: "User is not a faculty" });

    faculty.isApproved = true;
    await faculty.save();

    // Create Faculty record in Faculty collection if not exists
    let facultyDoc = await Faculty.findOne({ user_id: faculty._id });
    if (!facultyDoc) {
      facultyDoc = await Faculty.create({
        user_id: faculty._id,
        name: faculty.name,
        department: "Not assigned",
        max_weekly_hours: 20,
      });
    }

    // Send approval email
    try {
      await sendFacultyApprovedEmail(faculty);
    } catch (e) {
      console.warn("Faculty approval email failed:", e.message);
    }

    res.status(200).json({
      message: "Faculty approved successfully",
      faculty: facultyDoc,
    });
  } catch (error) {
    console.error("Approval error:", error);
    res.status(500).json({ message: "Approval failed" });
  }
};

/* ============================================================
   👤 STEP 6: Get Current User (for frontend session)
   ============================================================ */
export const getMe = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isApproved: user.isApproved,
    });
  } catch (error) {
    console.error("getMe error:", error);
    res.status(500).json({ message: "Failed to fetch user info" });
  }
};
