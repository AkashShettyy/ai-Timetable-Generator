import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function Profile() {
  const { user, token } = useAuth();

  // Faculty-specific states
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [facultySubjects, setFacultySubjects] = useState([]);
  const [editingSubject, setEditingSubject] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("");

  // Student data
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ==========================================================
     🔹 FACULTY LOGIC: Fetch available subjects & manage selections
     ========================================================== */
  useEffect(() => {
    if (user?.role === "faculty") {
      fetchAvailableSubjects();
      loadFacultySubjects();
      setLoading(false);
    } else if (user?.role === "student" && token) {
      fetchStudentProfile();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  const fetchAvailableSubjects = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableSubjects(res.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const loadFacultySubjects = () => {
    const saved = localStorage.getItem(`faculty_subjects_${user?.id}`);
    if (saved) setFacultySubjects(JSON.parse(saved));
    else
      setFacultySubjects([
        { id: 1, title: "", code: "" },
        { id: 2, title: "", code: "" },
        { id: 3, title: "", code: "" },
        { id: 4, title: "", code: "" },
      ]);
  };

  const saveFacultySubjects = (subjects) => {
    localStorage.setItem(
      `faculty_subjects_${user?.id}`,
      JSON.stringify(subjects)
    );
    setFacultySubjects(subjects);
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject.id);
    setSelectedSubject(
      subject.title && subject.code ? `${subject.title}|${subject.code}` : ""
    );
  };

  const handleSaveSubject = (id) => {
    if (selectedSubject) {
      const [title, code] = selectedSubject.split("|");
      const updated = facultySubjects.map((s) =>
        s.id === id ? { ...s, title, code } : s
      );
      saveFacultySubjects(updated);
      setEditingSubject(null);
      setSelectedSubject("");
    }
  };

  const handleCancelEdit = () => {
    setEditingSubject(null);
    setSelectedSubject("");
  };

  /* ==========================================================
     🎓 STUDENT LOGIC: Fetch profile from backend
     ========================================================== */
  const fetchStudentProfile = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE || "http://localhost:5000/api"
        }/students/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStudentData(data);
      }
    } catch (error) {
      console.error("Error fetching student profile:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     🧾 UI RENDERING
     ========================================================== */

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-700 text-lg">
          Please log in to view your profile.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-700 text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {user.name}
              </h3>
              <p className="text-gray-600 text-sm">{user.email}</p>
              <p className="text-blue-600 text-sm font-medium capitalize">
                {user.role}
              </p>
            </div>
          </div>
          <hr className="my-4" />
          <p className="text-gray-700 text-sm">
            Manage your personal, academic, or teaching information here.
          </p>
        </div>

        {/* 🧑‍🏫 FACULTY SECTION */}
        {user.role === "faculty" && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              My Subjects (Max 4)
            </h2>

            <div className="space-y-4">
              {facultySubjects.map((subject) => (
                <div
                  key={subject.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  {editingSubject === subject.id ? (
                    <div className="space-y-3">
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        <option value="">Select Subject</option>
                        {availableSubjects.map((subj) => (
                          <option
                            key={subj._id}
                            value={`${subj.title}|${subj.code}`}
                          >
                            {subj.title} ({subj.code})
                          </option>
                        ))}
                      </select>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveSubject(subject.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Course Name:{" "}
                          {subject.title || "Not Defined"}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Code: {subject.code || "N/A"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleEditSubject(subject)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-gray-500 text-sm mt-4">
              Select up to 4 subjects from available courses.
            </p>
          </div>
        )}

        {/* 🧑‍🎓 STUDENT SECTION */}
        {user.role === "student" && (
          <div className="bg-white shadow-md rounded-lg p-6">
            {studentData ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Student Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Semester
                    </label>
                    <p className="text-gray-800">{studentData.year}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Program
                    </label>
                    <p className="text-gray-800">{studentData.program}</p>
                  </div>
                </div>

                {/* All Course Types */}
                <div className="space-y-4">
                  {/* Major Courses */}
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">
                      Major Courses ({studentData.major_courses?.length || 0})
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {studentData.major_courses?.length ? (
                        studentData.major_courses.map((course) => (
                          <span
                            key={course._id}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {course.code} - {course.title}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">No major courses</span>
                      )}
                    </div>
                  </div>

                  {/* Minor Courses */}
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">
                      Minor Courses ({studentData.minor_courses?.length || 0})
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {studentData.minor_courses?.length ? (
                        studentData.minor_courses.map((course) => (
                          <span
                            key={course._id}
                            className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                          >
                            {course.code} - {course.title}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">No minor courses</span>
                      )}
                    </div>
                  </div>

                  {/* Optional Courses */}
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">
                      Optional Courses ({studentData.optional_courses?.length || 0})
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {studentData.optional_courses?.length ? (
                        studentData.optional_courses.map((course) => (
                          <span
                            key={course._id}
                            className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm"
                          >
                            {course.code} - {course.title}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">No optional courses</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center">
                Student profile not found. Please complete registration.
              </p>
            )}
          </div>
        )}

        {/* 🧑‍💼 ADMIN INFO */}
        {user.role === "admin" && (
          <div className="bg-white shadow-md rounded-lg p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Admin Controls
            </h2>
            <p className="text-gray-600 text-sm">
              Access faculty and student management in your dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
