import React, { useState, useEffect } from "react";
import axios from "axios";

// Custom event for syncing with teaching schedule
const AVAILABILITY_UPDATED_EVENT = 'availabilityUpdated';

export default function FacultyAvailabilityUpdate() {
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [facultyId, setFacultyId] = useState(null);
  const [justUpdated, setJustUpdated] = useState(false);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const timeSlots = [
    "09:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", "13:00-14:00",
    "14:00-15:00", "15:00-16:00"
  ];

  useEffect(() => {
    fetchFacultyData();
  }, []);

  const fetchFacultyData = async () => {
    if (justUpdated) {
      console.log('Skipping fetch - just updated');
      return; // Don't fetch if we just updated
    }
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE}/faculty/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      console.log('Fetched faculty data:', res.data);
      setFacultyId(res.data._id);
      setAvailability(res.data.availability || {});
    } catch (err) {
      console.error("Failed to fetch faculty data:", err);
      setMessage("Faculty profile not found. Please contact admin.");
    }
  };

  const handleAvailabilityChange = (day, timeSlot, isAvailable) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [timeSlot]: isAvailable
      }
    }));
  };

  const updateAvailability = async () => {
    if (!facultyId) {
      setMessage("Faculty ID not found. Please contact admin.");
      return;
    }

    console.log('Updating availability:', availability);
    console.log('Faculty ID:', facultyId);

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Use the new sync endpoint
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE}/faculty/sync-availability`,
        { availability },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      console.log('Sync response:', res.data);
      
      // Send automatic follow-up email to admin about unavailability
      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE}/admin/faculty-unavailable-alert`,
          { facultyId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (emailErr) {
        console.error('Failed to send unavailability alert:', emailErr);
      }
      
      // Show detailed sync message
      const conflictMessage = res.data.conflicts > 0 
        ? ` Found ${res.data.conflicts} schedule conflicts that need admin attention.`
        : ' No schedule conflicts detected.';
      
      setMessage(`Availability updated successfully! Teaching schedule synced automatically.${conflictMessage} Admin has been notified of changes.`);
      
      // Notify teaching schedule component to refresh with detailed sync info
      window.dispatchEvent(new CustomEvent(AVAILABILITY_UPDATED_EVENT, {
        detail: { 
          availability, 
          facultyId,
          conflicts: res.data.conflicts,
          conflictingClasses: res.data.conflictingClasses || []
        }
      }));
      
      // Prevent automatic refresh for 10 seconds
      setJustUpdated(true);
      setTimeout(() => setJustUpdated(false), 10000);
    } catch (err) {
      console.error('Update availability error:', err);
      setMessage(err.response?.data?.message || "Failed to update availability");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-blue-700">
        Update Your Availability
      </h2>
      
      <p className="text-gray-600 mb-4">
        Please update your availability if you cannot take your scheduled classes. 
        Green indicates you are available, red indicates you are not available.
        <span className="block text-blue-600 text-sm mt-1">
          ℹ️ Changes will automatically sync with your teaching schedule below.
        </span>
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-100">Time Slot</th>
              {days.map(day => (
                <th key={day} className="border border-gray-300 p-2 bg-gray-100">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(timeSlot => (
              <tr key={timeSlot}>
                <td className="border border-gray-300 p-2 font-medium">
                  {timeSlot === "12:00-13:00" ? "🍽️ Lunch Break" : timeSlot}
                </td>
                {days.map(day => {
                  // Lunch break is always unavailable for classes
                  if (timeSlot === "12:00-13:00") {
                    return (
                      <td key={`${day}-${timeSlot}`} className="border border-gray-300 p-2 text-center bg-orange-100">
                        <div className="text-orange-800 text-sm font-medium">Lunch</div>
                      </td>
                    );
                  }
                  
                  const isAvailable = availability[day]?.[timeSlot] !== false;
                  return (
                    <td key={`${day}-${timeSlot}`} className="border border-gray-300 p-2 text-center">
                      <button
                        onClick={() => handleAvailabilityChange(day, timeSlot, !isAvailable)}
                        className={`w-8 h-8 rounded ${
                          isAvailable 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-red-500 hover:bg-red-600'
                        } text-white transition-colors`}
                        title={isAvailable ? 'Available' : 'Not Available'}
                      >
                        {isAvailable ? '✓' : '✗'}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex gap-4 items-center">
        <button
          onClick={updateAvailability}
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {loading ? "Updating..." : "Update Availability"}
        </button>
        
        <button
          onClick={() => {
            console.log('Current availability state:', availability);
            console.log('Faculty ID:', facultyId);
            setMessage('Check console for debug info');
          }}
          className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition"
        >
          Debug
        </button>

        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Not Available</span>
          </div>
        </div>
      </div>
      


      {message && (
        <div className={`mt-4 p-3 rounded ${
          message.includes('success') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}