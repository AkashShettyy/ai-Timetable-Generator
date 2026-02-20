import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function FacultyClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [profileSubjects, setProfileSubjects] = useState([]);
  const [newClass, setNewClass] = useState({
    subject: "",
    hoursPerWeek: "",
    batch: "",
  });

  useEffect(() => {
    if (user?.role === "faculty") {
      fetchSubjects();
      loadClasses();
    }
  }, [user]);

  useEffect(() => {
    if (subjects.length > 0 && user?.id) {
      const filtered = getProfileSubjects();
      setProfileSubjects(filtered);
    }
  }, [subjects, user]);

  // 🧠 Get subjects linked to this faculty from Profile localStorage
  const getProfileSubjects = () => {
    const profileData = localStorage.getItem(`faculty_subjects_${user?.id}`);
    if (profileData && subjects.length > 0) {
      const profileSubjects = JSON.parse(profileData);
      const subjectTitles = profileSubjects
        .filter((s) => s.title && s.title !== "" && s.title !== "undefined")
        .map((s) => s.title);
      return subjects.filter((subject) =>
        subjectTitles.includes(subject.title)
      );
    }
    return [];
  };

  // 📘 Fetch all subjects from backend
  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE}/courses`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubjects(response.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  // 💾 Load faculty's existing classes from localStorage
  const loadClasses = () => {
    const savedClasses = localStorage.getItem(`faculty_classes_${user?.id}`);
    if (savedClasses) {
      setClasses(JSON.parse(savedClasses));
    }
  };

  // 💾 Save updated classes
  const saveClasses = (updatedClasses) => {
    localStorage.setItem(
      `faculty_classes_${user?.id}`,
      JSON.stringify(updatedClasses)
    );
    setClasses(updatedClasses);
  };

  // ➕ Add new class
  const handleAddClass = (e) => {
    e.preventDefault();
    if (newClass.subject && newClass.hoursPerWeek && newClass.batch) {
      const updatedClasses = [
        ...classes,
        {
          id: Date.now(),
          ...newClass,
          hoursPerWeek: parseInt(newClass.hoursPerWeek),
        },
      ];
      saveClasses(updatedClasses);
      setNewClass({ subject: "", hoursPerWeek: "", batch: "" });
    }
  };

  // ✏️ Update hours per week
  const handleUpdateHours = (id, newHours) => {
    const updatedClasses = classes.map((cls) =>
      cls.id === id
        ? { ...cls, hoursPerWeek: parseInt(newHours) || cls.hoursPerWeek }
        : cls
    );
    saveClasses(updatedClasses);
  };

  // ❌ Delete class
  const handleDeleteClass = (id) => {
    const updatedClasses = classes.filter((cls) => cls.id !== id);
    saveClasses(updatedClasses);
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
          <p className="text-gray-600">
            Manage your weekly teaching hours and subjects.
          </p>
        </div>

        {/* ➕ Add New Class */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Add New Class
          </h2>
          <form
            onSubmit={handleAddClass}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <select
              value={newClass.subject}
              onChange={(e) =>
                setNewClass({ ...newClass, subject: e.target.value })
              }
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
            >
              <option value="">Select Subject</option>
              {profileSubjects.map((subject) => (
                <option key={subject._id} value={subject.title}>
                  {subject.title} ({subject.code})
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Hours per Week"
              min="1"
              max="10"
              value={newClass.hoursPerWeek}
              onChange={(e) =>
                setNewClass({ ...newClass, hoursPerWeek: e.target.value })
              }
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
            />

            <input
              type="text"
              placeholder="Batch (e.g., CSE-A)"
              value={newClass.batch}
              onChange={(e) =>
                setNewClass({ ...newClass, batch: e.target.value })
              }
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
            />

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Add Class
            </button>
          </form>
        </div>

        {/* 📚 Classes List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Current Classes
            </h2>
          </div>
          <div className="p-6">
            {classes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No classes added yet.
              </p>
            ) : (
              <div className="space-y-4">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {cls.subject}
                      </h3>
                      <p className="text-gray-600">Batch: {cls.batch}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">
                          Hours/Week:
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={cls.hoursPerWeek}
                          onChange={(e) =>
                            handleUpdateHours(cls.id, e.target.value)
                          }
                          className="w-16 border border-gray-300 rounded px-2 py-1 text-center"
                        />
                      </div>
                      <button
                        onClick={() => handleDeleteClass(cls.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
