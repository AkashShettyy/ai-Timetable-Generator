import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import FacultyAvailabilityUpdate from "../components/FacultyAvailabilityUpdate";
import FacultyTimetable from "../components/FacultyTimetable";

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [todaysClasses, setTodaysClasses] = useState([]);

  useEffect(() => {
    if (user?.role === "faculty") {
      loadTodaysClasses();
    }
  }, [user]);

  const loadTodaysClasses = () => {
    try {
      const savedClasses = localStorage.getItem(`faculty_classes_${user?.id}`);
      if (savedClasses) {
        const allClasses = JSON.parse(savedClasses);
        // Generate a basic schedule for today
        const todaySchedule = allClasses.map((cls, index) => ({
          id: cls.id || index,
          subject: cls.subject || "N/A",
          time: `${9 + index * 2}:00-${10 + index * 2}:00`,
          batch: cls.batch || "Batch A",
          room: `10${index + 1}`,
        }));
        setTodaysClasses(todaySchedule);
      }
    } catch (err) {
      console.error("Failed to load faculty classes:", err);
    }
  };

  if (!user || user.role !== "faculty") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">
          Access restricted. Only faculty members can view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Faculty Dashboard
          </h1>
          <p className="text-gray-600">Welcome back, {user?.name} 👋</p>
        </div>

        {/* Today's Classes Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Today's Classes
          </h2>
          {todaysClasses.length === 0 ? (
            <p className="text-gray-500">No classes scheduled for today.</p>
          ) : (
            <div className="space-y-3">
              {todaysClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {cls.subject}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Batch: {cls.batch} | Room: {cls.room}
                    </p>
                  </div>
                  <p className="font-medium text-blue-600">{cls.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Availability Update Section */}
        <div className="mb-8">
          <FacultyAvailabilityUpdate />
        </div>

        {/* Sync Status Indicator */}
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center text-sm text-blue-700">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="font-medium">Availability changes automatically sync with your teaching schedule below</span>
          </div>
        </div>

        {/* Faculty Timetable Section */}
        <div className="mb-8">
          <FacultyTimetable />
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Timetable */}
          <Link
            to="/timetable"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  My Timetable
                </h3>
                <p className="text-gray-600">View your teaching schedule</p>
              </div>
            </div>
          </Link>

          {/* My Classes */}
          <Link
            to="/faculty/classes"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  My Classes
                </h3>
                <p className="text-gray-600">
                  Manage subjects and class allocations
                </p>
              </div>
            </div>
          </Link>

          {/* Profile */}
          <Link
            to="/profile"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <svg
                  className="w-6 h-6 text-purple-600"
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
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  My Profile
                </h3>
                <p className="text-gray-600">View or update personal details</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
