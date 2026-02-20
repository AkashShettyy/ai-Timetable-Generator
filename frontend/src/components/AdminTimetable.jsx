import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AdminTimetable() {
  const [timetable, setTimetable] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [timetableRes, facultyRes, roomsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE}/timetable/latest`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_BASE}/faculty`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_BASE}/rooms`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setTimetable(timetableRes.data.data || []);
      setFaculty(facultyRes.data || []);
      setRooms(roomsRes.data || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  const getFacultyName = (facultyId) => {
    const f = faculty.find(f => f._id === facultyId);
    return f?.name || f?.user_id?.name || "Unknown";
  };

  const getRoomName = (roomId) => {
    if (typeof roomId === 'string' && !roomId.match(/^[0-9a-fA-F]{24}$/)) {
      return roomId; // Already a room name
    }
    const room = rooms.find(r => r._id === roomId);
    return room?.name || `Room ${Math.floor(Math.random() * 900) + 100}`;
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const timeSlots = ["09:00-10:00", "10:00-11:00", "11:00-12:00", "13:00-14:00", "14:00-15:00", "15:00-16:00"];

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-blue-700">
          Class Timetable
        </h2>
        <button
          onClick={fetchData}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-3 bg-gray-100">Time</th>
              {days.map(day => (
                <th key={day} className="border border-gray-300 p-3 bg-gray-100">
                  {day === "Mon" ? "Monday" : day === "Tue" ? "Tuesday" : day === "Wed" ? "Wednesday" : day === "Thu" ? "Thursday" : "Friday"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(timeSlot => (
              <tr key={timeSlot}>
                <td className="border border-gray-300 p-3 font-medium bg-gray-50">
                  {timeSlot}
                </td>
                {days.map(day => {
                  const slot = timetable.find(t => 
                    t.day === day && (t.time_slot === timeSlot || t.time === timeSlot)
                  );
                  
                  if (!slot) {
                    return (
                      <td key={`${day}-${timeSlot}`} className="border border-gray-300 p-4 text-center text-gray-400">
                        Free Period
                      </td>
                    );
                  }

                  return (
                    <td key={`${day}-${timeSlot}`} className="border border-gray-300 p-4 bg-blue-50">
                      <div className="space-y-1">
                        <div className="font-semibold text-blue-800">
                          {slot.course_name || slot.course}
                        </div>
                        <div className="text-sm text-gray-600">
                          👨🏫 {getFacultyName(slot.faculty_id)}
                        </div>
                        <div className="text-sm text-gray-600">
                          🏫 {getRoomName(slot.room_id || slot.room)}
                        </div>
                        <div className="text-xs text-blue-600">
                          Sem {slot.semester || slot.batch_id?.replace('Sem', '') || '1'}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Total Classes: {timetable.length}
      </div>
    </div>
  );
}
