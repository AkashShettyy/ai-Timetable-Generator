import React from "react";
import { Link } from "react-router-dom";
import FacultyManagement from "../components/FacultyManagement";
import AdminTimetable from "../components/AdminTimetable";
import AdminNotifications from "../components/AdminNotifications";

export default function AdminPage() {

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Notifications at top */}
      <AdminNotifications />

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/admin/faculty-verify"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
        >
          <h3 className="text-lg font-semibold text-blue-600 mb-2">
            Faculty Verification
          </h3>
          <p className="text-gray-600">Approve pending faculty registrations</p>
        </Link>

        <Link
          to="/admin/faculty-manage"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
        >
          <h3 className="text-lg font-semibold text-green-600 mb-2">
            Faculty Management
          </h3>
          <p className="text-gray-600">View faculties and generate timetables</p>
        </Link>

        <Link
          to="/admin/batches"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
        >
          <h3 className="text-lg font-semibold text-purple-600 mb-2">
            Batch Management
          </h3>
          <p className="text-gray-600">Manage student batches</p>
        </Link>
      </div>

      {/* Admin Management Sections */}
      <FacultyManagement />
      <AdminTimetable />
    </div>
  );
}
