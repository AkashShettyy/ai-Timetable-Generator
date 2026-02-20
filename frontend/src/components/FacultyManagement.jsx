import React, { useState, useEffect } from "react";
import axios from "axios";

export default function FacultyManagement() {
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchFaculty();
    fetchCourses();
    
    // Auto-refresh every 30 seconds to show updated availability
    const interval = setInterval(fetchFaculty, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchFaculty = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE}/faculty`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFaculty(res.data);
    } catch (err) {
      console.error("Failed to fetch faculty:", err);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE}/courses`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCourses(res.data);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  };

  const updateFacultyExpertise = async (facultyId, courseCode) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const facultyMember = faculty.find(f => f._id === facultyId);
      const currentExpertise = facultyMember.expertise || [];
      
      const updatedExpertise = currentExpertise.includes(courseCode)
        ? currentExpertise.filter(code => code !== courseCode)
        : [...currentExpertise, courseCode];

      await axios.put(
        `${import.meta.env.VITE_API_BASE}/faculty/${facultyId}`,
        { expertise: updatedExpertise },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setFaculty(prev => prev.map(f => 
        f._id === facultyId 
          ? { ...f, expertise: updatedExpertise }
          : f
      ));

      setMessage("Faculty expertise updated successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Failed to update faculty expertise");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-blue-700">
        Faculty Subject Assignment
      </h2>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes('success') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-3 bg-gray-100 text-left">Faculty Name</th>
              <th className="border border-gray-300 p-3 bg-gray-100 text-left">Department</th>
              <th className="border border-gray-300 p-3 bg-gray-100 text-left">Available Subjects</th>
              <th className="border border-gray-300 p-3 bg-gray-100 text-left">Availability Status</th>
            </tr>
          </thead>
          <tbody>
            {faculty.map(f => (
              <tr key={f._id}>
                <td className="border border-gray-300 p-3">
                  {f.user_id?.name || 'N/A'}
                </td>
                <td className="border border-gray-300 p-3">
                  {f.department}
                </td>
                <td className="border border-gray-300 p-3">
                  <div className="flex flex-wrap gap-2">
                    {courses.map(course => {
                      const isAssigned = f.expertise?.includes(course.code);
                      return (
                        <button
                          key={course.code}
                          onClick={() => updateFacultyExpertise(f._id, course.code)}
                          disabled={loading}
                          className={`px-3 py-1 rounded text-sm transition ${
                            isAssigned
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                          title={`${course.code} - ${course.title}`}
                        >
                          {course.code}
                        </button>
                      );
                    })}
                  </div>
                </td>
                <td className="border border-gray-300 p-3">
                  <div className="text-sm">
                    {f.availability && Object.keys(f.availability).length > 0 ? (
                      <span className="text-green-600">✓ Updated</span>
                    ) : (
                      <span className="text-gray-500">Not set</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded">
        <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
        <ul className="list-disc list-inside text-sm text-gray-700">
          <li>Click on subject codes to assign/unassign them to faculty</li>
          <li>Green subjects are assigned to the faculty member</li>
          <li>Gray subjects are not assigned</li>
          <li>Faculty can only be scheduled for subjects they are assigned to</li>
        </ul>
      </div>
    </div>
  );
}