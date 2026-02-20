import React, { useState, useEffect } from "react";
import axios from "axios";

export default function FacultyAlertComponent() {
  const [timetable, setTimetable] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [facultyList, setFacultyList] = useState([]);

  useEffect(() => {
    fetchTimetable();
    fetchFaculty();
  }, []);

  const fetchTimetable = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE}/timetable/latest`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTimetable(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch timetable:", err);
    }
  };

  const fetchFaculty = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE}/faculty`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFacultyList(res.data || []);
    } catch (err) {
      console.error("Failed to fetch faculty:", err);
    }
  };

  const sendAlertEmails = async () => {
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE}/admin/send-faculty-alerts`,
        { date: selectedDate },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send alerts");
    } finally {
      setLoading(false);
    }
  };

  const sendFollowUpEmails = async () => {
    if (!selectedDate || scheduledClasses.length === 0) {
      alert("Please select a date with scheduled classes");
      return;
    }

    const facultyIds = [...new Set(scheduledClasses.map(slot => slot.faculty_id))];
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE}/admin/send-follow-up`,
        { date: selectedDate, facultyIds },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send follow-up emails");
    } finally {
      setLoading(false);
    }
  };

  const getScheduledClasses = () => {
    if (!selectedDate || !timetable.length) return [];
    
    const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
    
    return timetable.filter(slot => 
      slot.day === dayOfWeek && slot.faculty_id
    );
  };

  const scheduledClasses = getScheduledClasses();

  const getFacultyName = (facultyId) => {
    const faculty = facultyList.find(f => f._id === facultyId);
    return faculty?.user_id?.name || facultyId;
  };

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-blue-700">
        Faculty Class Alerts
      </h2>
      
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date for Alerts
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border p-2 rounded w-full"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {selectedDate && (
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">
              Scheduled Classes for {new Date(selectedDate).toLocaleDateString()}:
            </h3>
            {scheduledClasses.length > 0 ? (
              <div className="space-y-2">
                {scheduledClasses.map((slot, index) => (
                  <div key={index} className="bg-white p-2 rounded border">
                    <p><strong>Time:</strong> {slot.time_slot}</p>
                    <p><strong>Course:</strong> {slot.course_name}</p>
                    <p><strong>Faculty:</strong> {getFacultyName(slot.faculty_id)}</p>
                    <p><strong>Room:</strong> {slot.room_id}</p>
                    <p><strong>Batch:</strong> {slot.batch_id}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No classes scheduled for this date</p>
            )}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={sendAlertEmails}
            disabled={loading || !selectedDate || scheduledClasses.length === 0}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? "Sending..." : "Send Alert Emails"}
          </button>
          
          <button
            onClick={sendFollowUpEmails}
            disabled={loading || !selectedDate || scheduledClasses.length === 0}
            className="bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 transition disabled:bg-gray-400"
          >
            {loading ? "Sending..." : "Send Follow-up Emails"}
          </button>
        </div>

        {message && (
          <div className={`mt-3 p-3 rounded ${
            message.includes('success') || message.includes('sent') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <div className="mt-4 p-4 bg-blue-50 rounded">
          <h4 className="font-semibold text-blue-800 mb-2">Email Content Preview:</h4>
          <p className="text-sm text-gray-700">
            The email will ask faculty members to:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
            <li>Confirm if they will be taking their scheduled class</li>
            <li>Update their availability on the website if they cannot attend</li>
            <li>Respond within 24 hours of receiving the email</li>
            <li>Contact admin if there are any scheduling conflicts</li>
          </ul>
        </div>
      </div>
    </div>
  );
}