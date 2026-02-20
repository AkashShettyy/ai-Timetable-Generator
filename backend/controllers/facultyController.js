import Faculty from "../models/Faculty.js";
import Timetable from "../models/Timetable.js";
import User from "../models/User.js";

export const createFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.create(req.body);
    res.status(201).json(faculty);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find()
      .populate("user_id", "name email isApproved")
      .lean();

    // Show only verified faculty or pre-approved mock data
    const visible = faculty
      .filter(f => f.user_id?.isApproved === true)
      .map(f => ({
        ...f,
        displayName: f.name || (f.user_id ? f.user_id.name : 'Unknown'),
        canTeach: f.expertise || [],
        isApproved: f.user_id ? f.user_id.isApproved : true
      }));

    res.json(visible);
  } catch (err) {
    console.error("Get faculty error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getPendingFaculty = async (req, res) => {
  try {
    const pendingFaculty = await Faculty.find()
      .populate("user_id", "name email isApproved facultyId")
      .lean();

    const pending = pendingFaculty
      .filter(f => f.user_id?.isApproved === false)
      .map(f => ({
        _id: f.user_id._id,
        name: f.name || f.user_id.name,
        email: f.user_id.email,
        facultyId: f.user_id.facultyId,
        department: f.department,
        expertise: f.expertise || []
      }));

    res.json(pending);
  } catch (err) {
    console.error("Get pending faculty error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const approveFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;
    
    const user = await User.findByIdAndUpdate(
      facultyId,
      { isApproved: true },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    
    res.json({ message: "Faculty approved successfully", user });
  } catch (err) {
    console.error("Approve faculty error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updateFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(faculty);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteFaculty = async (req, res) => {
  try {
    await Faculty.findByIdAndDelete(req.params.id);
    res.json({ message: "Faculty deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getMyFacultyProfile = async (req, res) => {
  try {
    let faculty = await Faculty.findOne({ user_id: req.user._id });
    if (!faculty) {
      faculty = await Faculty.create({
        user_id: req.user._id,
        department: "Not assigned",
        max_weekly_hours: 20,
        availability: {}
      });
    }
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateMyFacultyProfile = async (req, res) => {
  try {
    console.log('Updating faculty profile for user:', req.user._id);
    console.log('Update data:', req.body);
    
    const faculty = await Faculty.findOneAndUpdate(
      { user_id: req.user._id },
      req.body,
      { new: true, upsert: true }
    );
    
    console.log('Updated faculty:', faculty);
    res.json(faculty);
  } catch (err) {
    console.error('Update faculty profile error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const syncAvailabilityWithSchedule = async (req, res) => {
  try {
    const { availability } = req.body;
    const facultyId = req.user._id;
    
    console.log('🔄 Syncing availability with teaching schedule for faculty:', facultyId);
    console.log('New availability:', availability);
    
    // Update faculty availability
    const faculty = await Faculty.findOneAndUpdate(
      { user_id: facultyId },
      { availability },
      { new: true, upsert: true }
    );
    
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty profile not found' });
    }
    
    // Get latest timetable to check for conflicts
    const latestTimetable = await Timetable.findOne().sort({ created_at: -1 });
    
    if (latestTimetable && latestTimetable.data) {
      // Find classes assigned to this faculty that are now marked unavailable
      const conflictingClasses = latestTimetable.data.filter(slot => {
        if (slot.faculty_id !== faculty._id.toString()) return false;
        
        const dayMap = {"Mon": "Monday", "Tue": "Tuesday", "Wed": "Wednesday", "Thu": "Thursday", "Fri": "Friday"};
        const dayName = dayMap[slot.day];
        
        return availability[dayName] && availability[dayName][slot.time_slot] === false;
      });
      
      console.log('⚠️ Found', conflictingClasses.length, 'conflicting classes that need admin attention');
      
      res.json({
        message: 'Availability synced successfully with teaching schedule',
        faculty,
        conflicts: conflictingClasses.length,
        conflictingClasses: conflictingClasses.map(c => ({
          course: c.course_name,
          day: c.day,
          time: c.time_slot,
          room: c.room_id
        }))
      });
    } else {
      res.json({
        message: 'Availability updated successfully',
        faculty,
        conflicts: 0
      });
    }
    
  } catch (err) {
    console.error('Sync availability error:', err);
    res.status(500).json({ message: err.message });
  }
};
