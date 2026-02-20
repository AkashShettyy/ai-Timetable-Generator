import React, { useState, useEffect } from "react";
import axios from "axios";

export default function EnhancedTimetable() {
  const [timetable, setTimetable] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [timetableRes, facultyRes, coursesRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE}/timetable/latest`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_BASE}/faculty`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_BASE}/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setTimetable(timetableRes.data.data || []);
      setFaculty(facultyRes.data || []);
      setCourses(coursesRes.data || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  const getFacultyName = (facultyId) => {
    const f = faculty.find(f => f._id === facultyId);
    return f?.user_id?.name || "Unknown";
  };

  const isAvailable = (facultyId, day, timeSlot) => {
    const f = faculty.find(f => f._id === facultyId);
    const dayMap = {"Mon": "Monday", "Tue": "Tuesday", "Wed": "Wednesday", "Thu": "Thursday", "Fri": "Friday"};
    return f?.availability?.[dayMap[day]]?.[timeSlot] !== false;
  };

  const getAvailableFaculty = (courseCode, day, timeSlot) => {
    const dayMap = {"Mon": "Monday", "Tue": "Tuesday", "Wed": "Wednesday", "Thu": "Thursday", "Fri": "Friday"};
    return faculty.filter(f => 
      f.expertise?.includes(courseCode) && 
      f.availability?.[dayMap[day]]?.[timeSlot] !== false
    );
  };

  const replaceFaculty = async (slotIndex, newFacultyId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const updatedTimetable = [...timetable];
      updatedTimetable[slotIndex].faculty_id = newFacultyId;
      
      await axios.put(
        `${import.meta.env.VITE_API_BASE}/timetable/update`,
        { data: updatedTimetable },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTimetable(updatedTimetable);
      setMessage("Faculty replaced successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Failed to replace faculty");
    } finally {
      setLoading(false);
    }
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const timeSlots = ["09:00-10:00", "10:00-11:00", "11:00-12:00", "13:00-14:00", "14:00-15:00", "15:00-16:00"];

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-blue-700">
        Timetable with Faculty Availability
      </h2>
      
      {/* Debug info */}
      <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
        <p>Timetable entries: {timetable.length} | Faculty: {faculty.length}</p>
      </div>

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
              <th className="border border-gray-300 p-2 bg-gray-100">Time</th>
              {days.map(day => (
                <th key={day} className="border border-gray-300 p-2 bg-gray-100">
                  {day === "Mon" ? "Monday" : day === "Tue" ? "Tuesday" : day === "Wed" ? "Wednesday" : day === "Thu" ? "Thursday" : "Friday"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(timeSlot => (
              <tr key={timeSlot}>
                <td className="border border-gray-300 p-2 font-medium bg-gray-50">
                  {timeSlot}
                </td>
                {days.map(day => {
                  const slot = timetable.find(t => 
                    t.day === day && t.time_slot === timeSlot
                  );
                  
                  if (!slot) {
                    return (
                      <td key={`${day}-${timeSlot}`} className="border border-gray-300 p-2 text-center text-gray-400">
                        Free
                      </td>
                    );
                  }

                  const facultyName = getFacultyName(slot.faculty_id);
                  const available = isAvailable(slot.faculty_id, day, timeSlot);
                  const availableFaculty = getAvailableFaculty(slot.course_code, day, timeSlot);
                  const slotIndex = timetable.indexOf(slot);

                  return (
                    <td key={`${day}-${timeSlot}`} className="border border-gray-300 p-2">
                      <div className="text-xs space-y-1">
                        <div className="font-semibold">{slot.course_name || slot.course}</div>
                        <div className={`flex items-center gap-1 ${
                          available ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <span>{available ? '✓' : '✗'}</span>
                          <span className="font-medium">{facultyName}</span>
                        </div>
                        <div className="text-gray-500">Room: {slot.room_id || slot.room}</div>
                        <div className="text-gray-500">Batch: {slot.batch_id}</div>
                        
                        {!available && (
                          <div className="mt-2 p-2 bg-red-50 rounded">
                            <div className="text-red-600 font-medium mb-1">Faculty Unavailable</div>
                            {availableFaculty.length > 0 ? (
                              <select
                                onChange={(e) => replaceFaculty(slotIndex, e.target.value)}
                                disabled={loading}
                                className="w-full text-xs border rounded p-1"
                                defaultValue=""
                              >
                                <option value="">Replace with...</option>
                                {availableFaculty.map(f => (
                                  <option key={f._id} value={f._id}>
                                    {f.user_id?.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="text-xs text-red-500">
                                No qualified faculty available
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded">
        <h4 className="font-semibold text-blue-800 mb-2">Legend:</h4>
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Faculty Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-600">✗</span>
            <span>Faculty Not Available</span>
          </div>
        </div>
      </div>
    </div>
  );
}