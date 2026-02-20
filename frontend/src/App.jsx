import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

// 🧩 Route Guards
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// 🏠 Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOTP from "./pages/VerifyOTP";

// 👤 Common Protected Pages
import Profile from "./pages/Profile";
import TimetablePage from "./pages/TimetablePage.jsx";

// 🧑‍💼 Admin Pages
import AdminPage from "./pages/AdminPage.jsx";
import AdminBatchPage from "./pages/AdminBatchPage.jsx";
import AdminFacultyVerify from "./pages/AdminFacultyVerify.jsx";
import AdminFacultyManage from "./pages/AdminFacultyManage.jsx";

// 👨‍🏫 Faculty Pages
import FacultyDashboard from "./pages/FacultyDashboard.jsx";
import FacultyClasses from "./pages/FacultyClasses.jsx";

// 🎓 Student Pages
import StudentDashboard from "./pages/StudentDashboard.jsx";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* 🌍 Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/login" element={<Login />} />

        {/* 🔐 Common Protected Routes (any logged-in user) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/timetable"
          element={
            <ProtectedRoute>
              <TimetablePage />
            </ProtectedRoute>
          }
        />

        {/* 🧑‍💼 Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/batches"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminBatchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/faculty-verify"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminFacultyVerify />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/faculty-manage"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminFacultyManage />
            </ProtectedRoute>
          }
        />

        {/* 👨‍🏫 Faculty Routes */}
        <Route
          path="/faculty/dashboard"
          element={
            <ProtectedRoute allowedRoles={["faculty"]}>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/classes"
          element={
            <ProtectedRoute allowedRoles={["faculty"]}>
              <FacultyClasses />
            </ProtectedRoute>
          }
        />

        {/* 🎓 Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
