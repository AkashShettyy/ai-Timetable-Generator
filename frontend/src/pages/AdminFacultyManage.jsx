import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminFacultyManage() {
  const { token } = useAuth();
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFaculties = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/faculty`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFaculties(data);
      }
    } catch (error) {
      console.error('Error fetching faculties:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimetable = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/timetable/generate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        alert('✅ Timetable generated successfully!');
      }
    } catch (error) {
      console.error('Error generating timetable:', error);
      alert('❌ Failed to generate timetable');
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  if (loading) return <div className="p-6">Loading faculties...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Faculty Management</h1>
        <button
          onClick={generateTimetable}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          🤖 Generate AI Timetable
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expertise</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {faculties.map((faculty) => (
              <tr key={faculty._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {faculty.displayName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {faculty.department}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="max-w-xs">
                    <div className="font-medium text-gray-900 mb-1">Can Teach:</div>
                    <div className="text-xs">
                      {faculty.canTeach?.map((course, idx) => (
                        <span key={idx} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mr-1 mb-1">
                          {course}
                        </span>
                      )) || 'N/A'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    faculty.isApproved 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {faculty.isApproved ? 'Verified' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {faculties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No faculties found. Run the setup script to add sample faculties.</p>
        </div>
      )}
    </div>
  );
}