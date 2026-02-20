import React, { useEffect, useState } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useAuth } from "../context/AuthContext";
import AdminTimetable from "../components/AdminTimetable";

export default function TimetablePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState({});
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  // 📅 Fetch timetable data
  const fetchTimetable = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE}/timetable/latest`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const timetableData = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];

      const formatted = timetableData.map((item, index) => ({
        id: item._id || index,
        title: `${item.course || "Unknown"} (${item.room || "Room ?"})`,
        start: getDateForSlot(item.day, item.time?.split("-")[0] || "09:00"),
        end: getDateForSlot(item.day, item.time?.split("-")[1] || "10:00"),
      }));

      setEvents(formatted);
    } catch (err) {
      console.error("Fetch failed:", err.response?.data || err.message);
    }
  };

  // ⚙️ Admin - Generate timetable
  const generateTimetable = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE}/timetable/generate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      await fetchTimetable();
    } catch (err) {
      alert(err.response?.data?.message || "Error generating timetable");
    } finally {
      setLoading(false);
    }
  };

  // 🕒 Convert day + time → Date object for calendar
  const getDateForSlot = (day, time) => {
    const map = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5 };
    const date = new Date();
    const diff = map[day] - date.getDay();
    const slotDate = new Date(date);
    slotDate.setDate(date.getDate() + diff);
    const [h, m] = time.split(":");
    slotDate.setHours(parseInt(h), parseInt(m), 0, 0);
    return slotDate;
  };

  // 🧑‍🏫 Faculty - Handle event click to add/edit notes
  const handleEventClick = (clickInfo) => {
    if (user?.role === "faculty") {
      setSelectedEvent(clickInfo.event);
      setNoteText(notes[clickInfo.event.id] || "");
      setShowNoteModal(true);
    }
  };

  const handleSaveNote = () => {
    if (selectedEvent) {
      const updatedNotes = { ...notes, [selectedEvent.id]: noteText };
      setNotes(updatedNotes);
      localStorage.setItem(
        `faculty_notes_${user?.id}`,
        JSON.stringify(updatedNotes)
      );
      setShowNoteModal(false);
      setSelectedEvent(null);
      setNoteText("");
    }
  };

  // 💾 Load saved notes on page load
  useEffect(() => {
    fetchTimetable();
    if (user?.role === "faculty") {
      const saved = localStorage.getItem(`faculty_notes_${user?.id}`);
      if (saved) setNotes(JSON.parse(saved));
    }
  }, []);

  // Show AdminTimetable for admin users
  if (user?.role === "admin") {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-blue-700">
            Admin Timetable Management
          </h1>
          <button
            onClick={generateTimetable}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
          >
            {loading ? "Generating..." : "Generate New Timetable"}
          </button>
        </div>
        <AdminTimetable />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-blue-700">
            My Timetable
          </h1>
          {user?.role === "faculty" && (
            <p className="text-sm text-gray-600">
              Click on any event to add notes for students
            </p>
          )}
          {user?.role === "student" && (
            <p className="text-sm text-gray-600">
              🟢 Green events contain faculty notes.
            </p>
          )}
        </div>
      </div>

      {/* Calendar */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridWeek,timeGridDay",
        }}
        events={events.map((event) => ({
          ...event,
          backgroundColor: notes[event.id] ? "#10b981" : "#3b82f6",
          title: notes[event.id]
            ? `${event.title} 📝`
            : event.title,
        }))}
        eventClick={handleEventClick}
        height="80vh"
      />

      {/* 📝 Notes Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold mb-4">
              Add Note for Students
            </h3>
            <p className="text-sm text-gray-600 mb-2">{selectedEvent?.title}</p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter note for students..."
              className="w-full h-32 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
