import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function StudentRegistration({ studentData, onRegistrationComplete }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    semester: "",
    major_subject: "",
    minor_subject: "",
    major_courses: [],
    minor_courses: [],
    optional_courses: []
  });

  const [coursesByCategory, setCoursesByCategory] = useState({
    major: [],
    minor: [],
    optional: []
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔹 Load courses when semester changes + prefill if already registered
  useEffect(() => {
    if (studentData) {
      const semester = studentData.year || "";
      setFormData({
        semester,
        major_subject: studentData.major_subject || "",
        minor_subject: studentData.minor_subject || "",
        major_courses: studentData.major_courses?.map((c) => c._id) || [],
        minor_courses: studentData.minor_courses?.map((c) => c._id) || [],
        optional_courses: studentData.optional_courses?.map((c) => c._id) || []
      });
      if (semester) {
        fetchCoursesByCategory(semester);
      }
    }
  }, [studentData]);
  
  // Fetch courses when semester selection changes
  useEffect(() => {
    if (formData.semester) {
      fetchCoursesByCategory(formData.semester);
      // Reset course selections when semester changes
      setFormData(prev => ({
        ...prev,
        major_courses: [],
        minor_courses: [],
        optional_courses: []
      }));
    }
  }, [formData.semester]);

  // 📚 Fetch courses grouped by category for selected semester
  const fetchCoursesByCategory = async (semester) => {
    if (!semester) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/courses/by-category?semester=${semester}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setCoursesByCategory(data || { major: [], minor: [], optional: [] });
      } else {
        console.error("Failed to load courses:", res.status);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  // 🧠 Helpers for managing selections
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addCourse = (courseId, category) => {
    setFormData((prev) => ({
      ...prev,
      [category]: [...prev[category], courseId]
    }));
  };

  const removeCourse = (courseId, category) => {
    setFormData((prev) => ({
      ...prev,
      [category]: prev[category].filter((id) => id !== courseId)
    }));
  };

  const getSelectedCourses = (category) => {
    const key =
      category === "major_courses"
        ? "major"
        : category === "minor_courses"
        ? "minor"
        : "optional";
    return coursesByCategory[key].filter((c) => formData[category].includes(c._id));
  };

  const getAvailableCourses = (category) => {
    const key =
      category === "major_courses"
        ? "major"
        : category === "minor_courses"
        ? "minor"
        : "optional";
    return coursesByCategory[key].filter((c) => !formData[category].includes(c._id));
  };

  // 🚀 Handle Register / Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validation
    const majorAvailable = coursesByCategory.major?.length || 0;
    const minorAvailable = coursesByCategory.minor?.length || 0;
    
    if (formData.major_courses.length !== majorAvailable) {
      setMessage(`Please select all ${majorAvailable} major courses`);
      setLoading(false);
      return;
    }
    
    if (formData.minor_courses.length !== minorAvailable) {
      setMessage(`Please select all ${minorAvailable} minor courses`);
      setLoading(false);
      return;
    }
    
    if (formData.optional_courses.length < 2) {
      setMessage("Please select at least 2 optional courses");
      setLoading(false);
      return;
    }

    try {
      const endpoint = studentData
        ? `${import.meta.env.VITE_API_BASE}/students/profile`
        : `${import.meta.env.VITE_API_BASE}/students/register`;

      const method = studentData ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          program: "Undergraduate",
          year: parseInt(formData.semester),
          major_subject: formData.major_subject,
          minor_subject: formData.minor_subject,
          major_courses: formData.major_courses,
          minor_courses: formData.minor_courses,
          optional_courses: formData.optional_courses
        })
      });

      if (res.ok) {
        // Regenerate timetable with new courses if profile was updated
        if (studentData) {
          try {
            await fetch(`${import.meta.env.VITE_API_BASE}/students/regenerate-timetable`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                major_courses: formData.major_courses,
                minor_courses: formData.minor_courses,
                optional_courses: formData.optional_courses
              })
            });
          } catch (timetableErr) {
            console.error('Failed to regenerate timetable:', timetableErr);
          }
        }
        
        setMessage(
          studentData
            ? "✅ Profile updated successfully! Timetable regenerated."
            : "🎉 Registration successful!"
        );
        onRegistrationComplete();
      } else {
        const err = await res.json();
        setMessage(err.message || "An error occurred");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setMessage("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🧾 UI Rendering
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {studentData ? "Update Student Profile" : "Student Registration"}
      </h2>

      {message && (
        <div
          className={`mb-4 p-4 rounded-md ${
            message.includes("success")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 🎓 Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester
            </label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select Semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stream / Branch
            </label>
            <select
              name="major_subject"
              value={formData.major_subject}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select Stream / Branch</option>
              {[
                "Computer Science",
                "Information Technology",
                "Electronics",
                "Mechanical",
                "Civil",
                "Electrical"
              ].map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section
            </label>
            <select
              name="minor_subject"
              value={formData.minor_subject}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select Section</option>
              {["Section A", "Section B"].map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 🔹 Course Sections */}
        {[
          { label: "Major", key: "major_courses", color: "blue", required: "All 3 required", fixed: true },
          { label: "Minor", key: "minor_courses", color: "purple", required: "All 3 required", fixed: true },
          { label: "Optional", key: "optional_courses", color: "orange", required: "Minimum 2 required", fixed: false }
        ].map(({ label, key, color, required, fixed }) => (
          <div key={key}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {label} Courses - {required} {fixed && "(Fixed)"}
              </h3>
              <span className="text-sm text-gray-500">
                Selected: {formData[key].length}
              </span>
            </div>

            {/* Available Courses */}
            <div className="mb-4 flex flex-wrap gap-2">
              {fixed ? (
                // Fixed courses - auto-select all
                getAvailableCourses(key).length > 0 ? (
                  <div className="w-full">
                    <p className="text-sm text-blue-600 mb-2">
                      ℹ️ These courses are automatically selected for your semester.
                    </p>
                    {getAvailableCourses(key).map((course) => (
                      <button
                        key={course._id}
                        type="button"
                        onClick={() => addCourse(course._id, key)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm bg-${color}-100 text-${color}-800 hover:bg-${color}-200 mr-2 mb-2`}
                      >
                        <span className="mr-1">+</span>
                        {course.code} - {course.title}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No {label.toLowerCase()} courses available for this semester.
                  </p>
                )
              ) : (
                // Optional courses - choose minimum 2
                getAvailableCourses(key).length > 0 ? (
                  <div className="w-full">
                    <p className="text-sm text-orange-600 mb-2">
                      🎯 Choose at least 2 optional courses from the available options.
                    </p>
                    {getAvailableCourses(key).map((course) => (
                      <button
                        key={course._id}
                        type="button"
                        onClick={() => addCourse(course._id, key)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm bg-${color}-100 text-${color}-800 hover:bg-${color}-200 mr-2 mb-2`}
                      >
                        <span className="mr-1">+</span>
                        {course.code} - {course.title}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No {label.toLowerCase()} courses available for this semester.
                  </p>
                )
              )}
            </div>

            {/* Selected Courses */}
            <div className="space-y-2">
              {getSelectedCourses(key).map((course) => (
                <div
                  key={course._id}
                  className="flex items-center justify-between bg-green-50 p-3 rounded-md"
                >
                  <span className="text-sm text-gray-700">
                    {course.code} - {course.title} ({course.credits} credits)
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCourse(course._id, key)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : studentData
              ? "Update Profile"
              : "Register"}
          </button>
        </div>
      </form>
    </div>
  );
}
