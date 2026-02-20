import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminBatchPage() {
  const [selectedCategory, setSelectedCategory] = useState("major");
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    code: "",
    title: "",
    credits: "",
    total_hours: "",
    category: "major",
  });

  const token = localStorage.getItem("token");
  const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });

  // 🔹 Fetch courses by category
  const fetchCoursesByCategory = async (category) => {
    try {
      const res = await API.get(`/courses/category/${category}`);
      setCourses(res.data);
    } catch (err) {
      console.error("Error fetching:", err.response?.data || err.message);
    }
  };

  // 🔹 Add course
  const addCourse = async () => {
    if (!form.code || !form.title || !form.credits || !form.total_hours)
      return alert("Please fill all fields");

    try {
      await API.post("/courses", form);
      alert("✅ Course created successfully");
      fetchCoursesByCategory(form.category);
      setForm({
        code: "",
        title: "",
        credits: "",
        total_hours: "",
        category: form.category,
      });
    } catch (err) {
      alert(err.response?.data?.message || "Error creating course");
    }
  };

  // 🔹 Delete course
  const deleteCourse = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete '${title}'?`)) return;
    try {
      const res = await API.delete(`/courses/${id}`);
      alert(res.data.message || "Course deleted successfully");
      fetchCoursesByCategory(selectedCategory);
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting course");
    }
  };

  useEffect(() => {
    fetchCoursesByCategory(selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-blue-700 mb-4">
        Course Management
      </h1>

      {/* Batch Buttons */}
      <div className="flex gap-3 mb-6">
        {["major", "minor", "optional"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-md capitalize ${
              selectedCategory === cat
                ? "bg-blue-700 text-white"
                : "bg-white border hover:bg-blue-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Add Course */}
      <div className="bg-white p-4 rounded-md shadow mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          Add New Course
        </h2>
        <div className="grid grid-cols-5 gap-3 mb-4">
          <input
            placeholder="Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="border px-3 py-2 rounded-md"
          />
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border px-3 py-2 rounded-md"
          />
          <input
            type="number"
            placeholder="Credits"
            value={form.credits}
            onChange={(e) => setForm({ ...form, credits: e.target.value })}
            className="border px-3 py-2 rounded-md"
          />
          <input
            type="number"
            placeholder="Total Hours"
            value={form.total_hours}
            onChange={(e) =>
              setForm({ ...form, total_hours: e.target.value })
            }
            className="border px-3 py-2 rounded-md"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="border px-3 py-2 rounded-md capitalize"
          >
            <option value="major">Major</option>
            <option value="minor">Minor</option>
            <option value="optional">Optional</option>
          </select>
        </div>
        <button
          onClick={addCourse}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Add Course
        </button>
      </div>

      {/* Course Table */}
      <div className="bg-white p-4 rounded-md shadow">
        <h2 className="text-lg font-semibold mb-3 text-gray-800 capitalize">
          Courses in {selectedCategory}
        </h2>
        {courses.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No courses found.</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Code</th>
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-left">Credits</th>
                <th className="p-2 text-left">Total Hours</th>
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c._id} className="border-t">
                  <td className="p-2">{c.code}</td>
                  <td className="p-2">{c.title}</td>
                  <td className="p-2">{c.credits}</td>
                  <td className="p-2">{c.total_hours}</td>
                  <td className="p-2 capitalize">{c.category}</td>
                  <td className="p-2">
                    <button
                      onClick={() => deleteCourse(c._id, c.title)}
                      className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
