import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 🚀 Redirect authenticated users to respective dashboards
  useEffect(() => {
    if (user) {
      if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "faculty") navigate("/faculty/dashboard");
      else if (user.role === "student") navigate("/student/dashboard");
    }
  }, [user, navigate]);

  // 🧭 If logged in — show quick welcome before redirect
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-2xl bg-white w-full rounded-md shadow p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 mb-4">
            Redirecting to your{" "}
            <span className="font-semibold capitalize">{user.role}</span>{" "}
            dashboard...
          </p>
          <button
            onClick={() => {
              if (user.role === "admin") navigate("/admin/dashboard");
              else if (user.role === "faculty") navigate("/faculty/dashboard");
              else if (user.role === "student") navigate("/student/dashboard");
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Go Now
          </button>
        </div>
      </div>
    );
  }

  // 🏠 Default landing page for visitors
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 🌟 Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-blue-700">NOVA</span> Timetable Generator
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Smarter scheduling and academic planning for every institution.
          </p>
          <Link
            to="/signup"
            className="bg-blue-600 text-white px-8 py-3 rounded-md text-lg hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
        </div>

        {/* 🔐 Role-based Login Options */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Admin Portal */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Admin Portal
            </h3>
            <p className="text-gray-600 mb-4">
              Manage faculty, students, and schedule configurations.
            </p>
            <Link
              to="/login"
              className="inline-block bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition"
            >
              Admin Login
            </Link>
          </div>

          {/* Faculty Portal */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Faculty Portal
            </h3>
            <p className="text-gray-600 mb-4">
              View your teaching schedule and class assignments.
            </p>
            <Link
              to="/login"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Faculty Login
            </Link>
          </div>

          {/* Student Portal */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Student Portal
            </h3>
            <p className="text-gray-600 mb-4">
              Check your class schedule and study plan.
            </p>
            <Link
              to="/login"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
            >
              Student Login
            </Link>
          </div>
        </div>

        {/* ✨ Sign Up Section */}
        <div className="text-center bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            New User?
          </h2>
          <p className="text-gray-600 mb-6">
            Create an account to get started with timetable automation.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-gray-800 text-white px-8 py-3 rounded-md hover:bg-gray-900 transition text-lg"
          >
            Sign Up Now
          </Link>
        </div>
      </div>
    </div>
  );
}
