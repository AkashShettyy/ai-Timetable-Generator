import React, { useState, useEffect } from "react";
import axios from "axios";

// Custom event for syncing with availability updates
const AVAILABILITY_UPDATED_EVENT = 'availabilityUpdated';

export default function FacultyTimetable() {
  const [myTimetable, setMyTimetable] = useState([]);
  const [facultyProfile, setFacultyProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncConflicts, setSyncConflicts] = useState(0);
  const [conflictingClasses, setConflictingClasses] = useState([]);

  const getSemesterFromBatch = (batchId) => {
    if (!batchId) return 'N/A';
    const match = batchId.toString().match(/\d+/);
    return match ? match[0] : batchId;
  };

  useEffect(() => {
    fetchMyTimetable();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchMyTimetable, 60000);
    
    // Listen for availability updates to sync immediately
    const handleAvailabilityUpdate = (event) => {
      console.log('🔄 Availability updated, syncing teaching schedule...', event.detail);
      setFacultyProfile(prev => ({
        ...prev,
        availability: event.detail.availability
      }));
      setLastSyncTime(new Date());
      setSyncConflicts(event.detail.conflicts || 0);
      setConflictingClasses(event.detail.conflictingClasses || []);
      fetchMyTimetable();
    };
    
    window.addEventListener(AVAILABILITY_UPDATED_EVENT, handleAvailabilityUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener(AVAILABILITY_UPDATED_EVENT, handleAvailabilityUpdate);
    };
  }, []);

  const fetchMyTimetable = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error('No token found');
        return;
      }
      
      console.log('🔍 Fetching faculty profile...');
      const profileRes = await axios.get(
        `${import.meta.env.VITE_API_BASE}/faculty/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFacultyProfile(profileRes.data);
      console.log('✅ Faculty profile loaded:', profileRes.data);

      console.log('🔍 Fetching global timetable...');
      const timetableRes = await axios.get(
        `${import.meta.env.VITE_API_BASE}/timetable/latest`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const allTimetable = timetableRes.data.data || [];
      console.log('✅ Global timetable loaded:', allTimetable.length, 'total classes');
      
      if (allTimetable.length === 0) {
        console.warn('⚠️ No timetable data found. Generate a timetable first.');
        setMyTimetable([]);
        return;
      }
      
      console.log('📋 Sample timetable entries:', allTimetable.slice(0, 3));
      
      const myClasses = allTimetable.filter(slot => {
        const profileId = profileRes.data._id?.toString();
        const slotFacultyId = slot.faculty_id?.toString();
        
        const directMatch = slot.faculty_id === profileRes.data._id;
        const stringMatch = slotFacultyId === profileId;
        const nameMatch = slot.faculty === profileRes.data.name;
        
        const match = directMatch || stringMatch || nameMatch;
        
        if (match) {
          console.log('✅ Found my class:', slot.course_name || slot.course, slot.day, slot.time_slot || slot.time);
        }
        return match;
      });
      
      console.log('🎯 My classes found:', myClasses.length);
      setMyTimetable(myClasses);
      
      if (myClasses.length === 0) {
        console.warn('⚠️ No classes assigned to this faculty.');
        console.log('Faculty ID from profile:', profileRes.data._id);
        console.log('Faculty name from profile:', profileRes.data.name);
        console.log('Unique faculty IDs in timetable:', [...new Set(allTimetable.map(s => s.faculty_id))]);
        console.log('Unique faculty names in timetable:', [...new Set(allTimetable.map(s => s.faculty))]);
      }
    } catch (err) {
      console.error("❌ Failed to fetch my timetable:", err);
      if (err.response?.status === 404) {
        console.log('📝 No timetable generated yet. Admin needs to generate timetable first.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isAvailable = (day, timeSlot) => {
    const dayMap = {"Mon": "Monday", "Tue": "Tuesday", "Wed": "Wednesday", "Thu": "Thursday", "Fri": "Friday"};
    return facultyProfile?.availability?.[dayMap[day]]?.[timeSlot] !== false;
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const timeSlots = ["09:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00"];

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-blue-700">
            My Teaching Schedule
          </h2>
          {lastSyncTime && (
            <div className="mt-1">
              <p className="text-sm text-green-600">
                ✓ Synced with availability at {lastSyncTime.toLocaleTimeString()}
              </p>
              {syncConflicts > 0 && (
                <p className="text-sm text-orange-600">
                  ⚠️ {syncConflicts} schedule conflicts detected - admin will reassign
                </p>
              )}
            </div>
          )}
        </div>
        <button
          onClick={fetchMyTimetable}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded">
        <p className="text-sm text-blue-800">
          <strong>Total Classes:</strong> {myTimetable.length} | 
          <strong> Free Periods:</strong> {(days.length * (timeSlots.length - 1)) - myTimetable.length}
          {syncConflicts > 0 && (
            <span className="ml-2 text-orange-700">
              | <strong>Recent Conflicts:</strong> {syncConflicts}
            </span>
          )}
        </p>
        {conflictingClasses.length > 0 && (
          <div className="mt-2 text-xs text-orange-700">
            <strong>Conflicting Classes:</strong> {conflictingClasses.map(c => `${c.course} (${c.day} ${c.time})`).join(', ')}
          </div>
        )}
      </div>

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
                  if (timeSlot === "12:00-13:00") {
                    return (
                      <td key={`${day}-${timeSlot}`} className="border border-gray-300 p-2 text-center bg-orange-100">
                        <div className="text-sm font-medium text-orange-800">🍽️ Lunch Break</div>
                      </td>
                    );
                  }

                  const mySlot = myTimetable.find(t => 
                    t.day === day && (t.time_slot === timeSlot || t.time === timeSlot)
                  );
                  
                  if (!mySlot) {
                    return (
                      <td key={`${day}-${timeSlot}`} className="border border-gray-300 p-2 text-center text-gray-400">
                        <div className="text-sm">Free Period</div>
                      </td>
                    );
                  }

                  const available = isAvailable(day, timeSlot);

                  return (
                    <td key={`${day}-${timeSlot}`} className={`border border-gray-300 p-2 ${!available ? 'bg-yellow-50' : 'bg-green-50'}`}>
                      <div className="text-xs space-y-1">
                        <div className="font-semibold">{mySlot.course_name || mySlot.course}</div>
                        <div className={`flex items-center gap-1 ${
                          available ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          <span>{available ? '✓' : '⚠️'}</span>
                          <span className="font-medium">
                            {available ? 'Available' : 'Marked Unavailable'}
                          </span>
                        </div>
                        <div className="text-gray-600">Room: {mySlot.room_id || mySlot.room}</div>
                        <div className="text-gray-600">Semester: {getSemesterFromBatch(mySlot.batch_id || mySlot.semester)}</div>
                        
                        {!available && (
                          <div className="mt-1 p-1 bg-orange-200 rounded text-orange-800 text-xs">
                            ⚠️ Admin will reassign
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
    </div>
  );
}